package pro.gowize.backend.web.dto;

public record AuthResponse(
        String token,
        String id,
        String name,
        String email
) {}
