package pro.gowize.backend.web.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank String name,
        @Email @NotBlank String email,
        @NotBlank @Size(min = 8) String password,
        String phone,
        String addressLine1,
        String addressLine2,
        String state,
        String country,
        String zipcode
) {}
