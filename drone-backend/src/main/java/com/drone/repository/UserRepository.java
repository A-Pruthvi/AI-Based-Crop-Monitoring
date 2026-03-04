package com.drone.repository;

import com.drone.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);

    List<User> findByRole(User.Role role);

    @Query("SELECT u FROM User u WHERE u.createdAt >= :since")
    List<User> findUsersCreatedSince(LocalDateTime since);

    @Query("SELECT u FROM User u WHERE u.lastLogin >= :since")
    List<User> findActiveUsersSince(LocalDateTime since);

    @Query("SELECT COUNT(u) FROM User u WHERE u.role = :role")
    Long countByRole(User.Role role);

    @Query("SELECT COUNT(u) FROM User u WHERE u.createdAt >= :since")
    Long countNewUsersSince(LocalDateTime since);

    List<User> findByEnabledTrue();

    List<User> findByEnabledFalse();
}
