package pro.gowize.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import pro.gowize.backend.domain.PushSubscription;
import pro.gowize.backend.repo.PushSubscriptionRepository;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.Map;

@Service
public class PushNotificationService {

    private static final Logger log = LoggerFactory.getLogger(PushNotificationService.class);

    private final PushSubscriptionRepository subscriptionRepo;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    public PushNotificationService(PushSubscriptionRepository subscriptionRepo,
                                   ObjectMapper objectMapper) {
        this.subscriptionRepo = subscriptionRepo;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newHttpClient();
    }

    public void sendToUser(String userId, String title, String body) {
        List<PushSubscription> subscriptions = subscriptionRepo.findByUserId(userId);
        for (PushSubscription sub : subscriptions) {
            try {
                String payload = objectMapper.writeValueAsString(Map.of(
                        "title", title,
                        "body", body
                ));
                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create(sub.getEndpoint()))
                        .header("Content-Type", "application/json")
                        .POST(HttpRequest.BodyPublishers.ofString(payload))
                        .build();
                HttpResponse<String> response = httpClient.send(request,
                        HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() == 410) {
                    // Subscription expired — remove it
                    subscriptionRepo.delete(sub);
                }
            } catch (Exception e) {
                log.warn("Push notification failed for user {}: {}", userId, e.getMessage());
            }
        }
    }
}
