package pro.gowize.backend.service;

import java.time.Instant;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import pro.gowize.backend.domain.User;
import pro.gowize.backend.repo.UserRepository;
import pro.gowize.backend.security.JwtUtil;
import pro.gowize.backend.web.dto.AuthResponse;
import pro.gowize.backend.web.dto.LoginRequest;
import pro.gowize.backend.web.dto.RegisterRequest;

@Service
public class AuthService {

    private final UserRepository userRepo;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final OtpStore otpStore;
    private final EmailService emailService;

    public AuthService(UserRepository userRepo, PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil, OtpStore otpStore, EmailService emailService) {
        this.userRepo = userRepo;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.otpStore = otpStore;
        this.emailService = emailService;
    }

    /** Saves unverified user and sends OTP. Returns nothing — caller must verify OTP to get a JWT. */
    public void register(RegisterRequest req) {
        String email = req.email().toLowerCase();
        if (userRepo.existsByEmail(email)) {
            // If account is already verified, reject. If it's unverified, allow resend.
            userRepo.findByEmail(email).ifPresent(u -> {
                if (u.isVerified()) throw new IllegalArgumentException("Email already registered");
            });
        } else {
            User user = new User();
            user.setId(UUID.randomUUID().toString());
            user.setCreatedAt(Instant.now());
            user.setName(req.name());
            user.setEmail(email);
            user.setPasswordHash(passwordEncoder.encode(req.password()));
            user.setPhone(req.phone());
            user.setAddressLine1(req.addressLine1());
            user.setAddressLine2(req.addressLine2());
            user.setState(req.state());
            user.setCountry(req.country());
            user.setZipcode(req.zipcode());
            user.setVerified(false);
            userRepo.save(user);
        }
        String otp = otpStore.generate(email);
        emailService.sendOtp(email, otp);
    }

    /** Verifies OTP and activates the account. Returns a JWT on success. */
    public AuthResponse verifyOtp(String email, String code) {
        String normalised = email.toLowerCase();
        if (!otpStore.verify(normalised, code)) {
            throw new IllegalArgumentException("Invalid or expired OTP");
        }
        User user = userRepo.findByEmail(normalised)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));
        user.setVerified(true);
        userRepo.save(user);
        String token = jwtUtil.generate(user.getId(), user.getEmail());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail());
    }

    /** Resends OTP for an unverified account. */
    public void resendOtp(String email) {
        String normalised = email.toLowerCase();
        User user = userRepo.findByEmail(normalised)
                .orElseThrow(() -> new IllegalArgumentException("No pending registration for this email"));
        if (user.isVerified()) throw new IllegalArgumentException("Account already verified");
        String otp = otpStore.generate(normalised);
        emailService.sendOtp(normalised, otp);
    }

    public AuthResponse login(LoginRequest req) {
        User user = userRepo.findByEmail(req.email().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("Invalid email or password"));
        if (!user.isVerified()) throw new IllegalArgumentException("Email not verified. Please check your inbox.");
        if (!passwordEncoder.matches(req.password(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid email or password");
        }
        String token = jwtUtil.generate(user.getId(), user.getEmail());
        return new AuthResponse(token, user.getId(), user.getName(), user.getEmail());
    }
}
