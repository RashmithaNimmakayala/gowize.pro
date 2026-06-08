package pro.gowize.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.services.sns.SnsClient;
import software.amazon.awssdk.services.sns.model.PublishRequest;

@Service
public class SmsService {

    private static final Logger log = LoggerFactory.getLogger(SmsService.class);

    private final SnsClient snsClient;
    private final boolean enabled;

    public SmsService(@Value("${gowize.sms.enabled:true}") boolean enabled) {
        this.snsClient = SnsClient.create();
        this.enabled = enabled;
    }

    public void sendSms(String phoneNumber, String message) {
        if (!enabled || phoneNumber == null || phoneNumber.isBlank()) return;
        try {
            snsClient.publish(PublishRequest.builder()
                    .phoneNumber(phoneNumber)
                    .message(message)
                    .build());
        } catch (Exception e) {
            log.warn("SMS failed to {}: {}", phoneNumber, e.getMessage());
        }
    }
}
