package com.chuka.srms.config;

import com.chuka.srms.model.AdminUser;
import com.chuka.srms.repository.AdminUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private AdminUserRepository adminUserRepository;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/login", "/forgot-password", "/reset-password", "/register", "/api/register", "/app.js", "/index.html", "/*.css").permitAll()
                        .anyRequest().authenticated()
                )
                .formLogin(form -> form
                        .loginPage("/login")
                        .defaultSuccessUrl("/", true)
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutSuccessUrl("/login?logout")
                        .permitAll()
                );
        return http.build();
    }

    @Bean
    public UserDetailsService userDetailsService(PasswordEncoder encoder) {
        return username -> {
            AdminUser admin = adminUserRepository.findById(username).orElse(null);

            // Auto-create default admin if database is empty
            if (admin == null && "admin".equals(username)) {
                AdminUser newAdmin = new AdminUser();
                newAdmin.setUsername("admin");
                newAdmin.setPassword(encoder.encode("admin123"));
                newAdmin.setEmail("johnoganda75@gmail.com"); 
                adminUserRepository.save(newAdmin);
                admin = newAdmin;
            }

            if (admin == null) throw new UsernameNotFoundException("User not found");

            return User.withUsername(admin.getUsername())
                    .password(admin.getPassword())
                    .roles("ADMIN")
                    .build();
        };
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
