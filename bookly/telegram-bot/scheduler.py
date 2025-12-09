from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from notifications import check_inactive_users, check_unfinished_books, check_new_books
from telegram.ext import Application

def setup_scheduler(application: Application):
    """Set up the notification scheduler."""
    scheduler = AsyncIOScheduler()
    
    # Schedule checks:
    # - Inactive users check daily at 10 AM
    scheduler.add_job(check_inactive_users, CronTrigger(hour=10, minute=0), args=(application,))
    
    # - Unfinished books check daily at 8 PM
    scheduler.add_job(check_unfinished_books, CronTrigger(hour=20, minute=0), args=(application,))
    
    # - New books check every 6 hours
    scheduler.add_job(check_new_books, CronTrigger(hour='*/6', minute=0), args=(application,))
    
    # Start the scheduler
    scheduler.start()
    print("Scheduler started")
    
    return scheduler