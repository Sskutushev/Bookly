# telegram-bot/scheduler.py

# IMPORTANT:
# Before running this script, you must install the dependencies and generate the Prisma client:
# 1. pip install -r requirements.txt
# 2. prisma py generate --schema=../backend/src/prisma/schema.prisma

import logging
import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from notifications import NotificationManager
from datetime import datetime, timedelta
from prisma import Prisma

# Enable logging
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s", level=logging.INFO
)
logger = logging.getLogger(__name__)

class NotificationScheduler:
    def __init__(self):
        self.scheduler = AsyncIOScheduler()
        self.notifier = NotificationManager()
        self.db = Prisma(auto_register=True)

    async def get_inactive_users(self, days_inactive=3):
        """Get users who have been inactive for a specified number of days."""
        cutoff_date = datetime.now() - timedelta(days=days_inactive)
        try:
            users = await self.db.user.find_many(
                where={
                    'notificationSettings': {
                        'is': {
                            'unfinishedReminder': True
                        }
                    },
                    'readingProgress': {
                        'every': {
                            'lastReadAt': {
                                'lt': cutoff_date
                            }
                        }
                    }
                }
            )
            return users
        except Exception as e:
            logger.error(f"Error getting inactive users: {e}")
            return []

    async def get_unfinished_books(self, days_since_last_read=7):
        """Get books that users started reading but haven't finished."""
        cutoff_date = datetime.now() - timedelta(days=days_since_last_read)
        try:
            progress_records = await self.db.readingprogress.find_many(
                where={
                    'progress': {
                        'gt': 10,
                        'lt': 100
                    },
                    'lastReadAt': {
                        'lt': cutoff_date
                    },
                    'user': {
                        'is': {
                            'notificationSettings': {
                                'is': {
                                    'unfinishedReminder': True
                                }
                            }
                        }
                    }
                },
                include={'user': True, 'book': True}
            )
            return progress_records
        except Exception as e:
            logger.error(f"Error getting unfinished books: {e}")
            return []
            
    async def send_inactive_reminders(self):
        """Send reminders to inactive users."""
        logger.info("Checking for inactive users...")
        await self.db.connect()
        try:
            users = await self.get_inactive_users()
            for user in users:
                if user.telegram_id:
                    await self.notifier.send_inactive_reminder(int(user.telegram_id))
            logger.info(f"Sent {len(users)} inactive reminders.")
        finally:
            await self.db.disconnect()

    async def send_unfinished_reminders(self):
        """Send reminders to continue reading unfinished books."""
        logger.info("Checking for unfinished books...")
        await self.db.connect()
        try:
            records = await self.get_unfinished_books()
            for record in records:
                if record.user and record.user.telegram_id:
                    await self.notifier.send_unfinished_reminder(
                        int(record.user.telegram_id),
                        record.book.title,
                        record.book.id,
                        record.progress
                    )
            logger.info(f"Sent {len(records)} unfinished reminders.")
        finally:
            await self.db.disconnect()
            
    def start(self):
        """Start the scheduler with all jobs."""
        self.scheduler.add_job(
            self.send_inactive_reminders,
            CronTrigger(hour=10, minute=0, second=0),
            id='inactive_reminders'
        )
        self.scheduler.add_job(
            self.send_unfinished_reminders,
            CronTrigger(hour=20, minute=0, second=0),
            id='unfinished_reminders'
        )
        self.scheduler.start()
        logger.info("Scheduler started with jobs.")

    def stop(self):
        """Stop the scheduler."""
        self.scheduler.shutdown()
        if self.db.is_connected():
            asyncio.run(self.db.disconnect())
        logger.info("Scheduler stopped.")

if __name__ == "__main__":
    scheduler = NotificationScheduler()
    scheduler.start()
    try:
        asyncio.get_event_loop().run_forever()
    except (KeyboardInterrupt, SystemExit):
        scheduler.stop()