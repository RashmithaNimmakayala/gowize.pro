package pro.gowize.backend.service;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class OtpStore {

    private static final long EXPIRY_MS = 10 * 60 * 1000L;
    private static final SecureRandom RNG = new SecureRandom();

    private record Entry(String code, Instant expiresAt) {}

    private final Map<String, Entry> store = new ConcurrentHashMap<>();

    public String generate(String email) {
        String code = String.format("%06d", RNG.nextInt(1_000_000));
        store.put(email.toLowerCase(), new Entry(code, Instant.now().plusMillis(EXPIRY_MS)));
        return code;
    }

    public boolean verify(String email, String code) {
        Entry entry = store.get(email.toLowerCase());
        if (entry == null || Instant.now().isAfter(entry.expiresAt())) {
            store.remove(email.toLowerCase());
            return false;
        }
        if (!entry.code().equals(code)) return false;
        store.remove(email.toLowerCase());
        return true;
    }

    public boolean hasPending(String email) {
        Entry entry = store.get(email.toLowerCase());
        if (entry == null) return false;
        if (Instant.now().isAfter(entry.expiresAt())) {
            store.remove(email.toLowerCase());
            return false;
        }
        return true;
    }
}
