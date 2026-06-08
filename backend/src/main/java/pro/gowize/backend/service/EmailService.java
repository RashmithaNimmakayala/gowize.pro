package pro.gowize.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;
    private final String from;

    public EmailService(JavaMailSender mailSender,
                        @Value("${gowize.mail.from}") String from) {
        this.mailSender = mailSender;
        this.from = from;
    }

    public void sendReminder(String toEmail, String subject, String body) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(from);
        msg.setTo(toEmail);
        msg.setSubject(subject);
        msg.setText(body);
        mailSender.send(msg);
    }

    public void sendOtp(String toEmail, String otp) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setFrom(from);
        msg.setTo(toEmail);
        msg.setSubject("Your GoWize verification code");
        msg.setText("""
                Hi,

                Your GoWize verification code is: %s

                This code expires in 10 minutes. Do not share it with anyone.

                — The GoWize Team
                """.formatted(otp));
        mailSender.send(msg);
    }
}
