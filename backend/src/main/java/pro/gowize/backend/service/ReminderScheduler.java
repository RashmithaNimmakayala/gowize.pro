package pro.gowize.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ReminderScheduler {

    private static final Logger log = LoggerFactory.getLogger(ReminderScheduler.class);

    private final ReminderService reminderService;

    public ReminderScheduler(ReminderService reminderService) {
        this.reminderService = reminderService;
    }

    // Runs every day at 9:00 AM IST (03:30 UTC)
    @Scheduled(cron = "0 30 3 * * *", zone = "UTC")
    public void runDailyReminders() {
        log.info("Running daily reminder job");
        reminderService.sendDailyReminders();
        log.info("Daily reminder job completed");
    }
}
