package pro.gowize.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import pro.gowize.backend.domain.Item;
import pro.gowize.backend.domain.User;
import pro.gowize.backend.repo.ItemRepository;
import pro.gowize.backend.repo.UserRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReminderService {

    private static final Logger log = LoggerFactory.getLogger(ReminderService.class);
    private static final int[] LEAD_DAYS = {3, 1};

    private final ItemRepository itemRepo;
    private final UserRepository userRepo;
    private final EmailService emailService;
    private final SmsService smsService;
    private final PushNotificationService pushService;

    public ReminderService(ItemRepository itemRepo, UserRepository userRepo,
                           EmailService emailService, SmsService smsService,
                           PushNotificationService pushService) {
        this.itemRepo = itemRepo;
        this.userRepo = userRepo;
        this.emailService = emailService;
        this.smsService = smsService;
        this.pushService = pushService;
    }

    public void sendDailyReminders() {
        LocalDate today = LocalDate.now();
        Map<String, User> userCache = userRepo.findAll().stream()
                .collect(Collectors.toMap(User::getId, u -> u));

        for (int days : LEAD_DAYS) {
            LocalDate targetDate = today.plusDays(days);
            List<Item> expiring = itemRepo.findAll().stream()
                    .filter(i -> "active".equals(i.getStatus()))
                    .filter(i -> targetDate.equals(i.getExpiryDate()))
                    .toList();

            for (Item item : expiring) {
                User user = userCache.get(item.getUserId());
                if (user == null || !user.isVerified()) continue;

                String daysLabel = days == 1 ? "tomorrow" : "in " + days + " days";
                String subject = "Reminder: " + item.getName() + " expires " + daysLabel;
                String message = buildMessage(item, days, daysLabel);

                // Email
                try {
                    emailService.sendReminder(user.getEmail(), subject, message);
                } catch (Exception e) {
                    log.warn("Email reminder failed for {}: {}", user.getEmail(), e.getMessage());
                }

                // SMS
                if (user.getPhone() != null && !user.getPhone().isBlank()) {
                    smsService.sendSms(user.getPhone(), subject + "\n" + message);
                }

                // Push
                pushService.sendToUser(user.getId(), subject, message);

                log.info("Reminders sent for item '{}' (user={}, days={})",
                        item.getName(), user.getEmail(), days);
            }
        }
    }

    private String buildMessage(Item item, int days, String daysLabel) {
        StringBuilder sb = new StringBuilder();
        sb.append("Hi! Just a heads-up:\n\n");
        sb.append("📦 ").append(item.getName());
        if (item.getBrand() != null && !item.getBrand().isBlank()) {
            sb.append(" by ").append(item.getBrand());
        }
        sb.append(" expires ").append(daysLabel);
        if (item.getExpiryDate() != null) {
            sb.append(" (").append(item.getExpiryDate()).append(")");
        }
        sb.append(".\n\nMake sure to use it before it expires!\n\n— GoWize");
        return sb.toString();
    }
}
