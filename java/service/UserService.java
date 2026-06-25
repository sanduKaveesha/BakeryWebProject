package com.bakery.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.bakery.repository.UserRepository;
import com.bakery.model.User;

// ─────────────────────────────────────────────────────────────────
//  OOP Concept → ABSTRACTION
//  UserService hides all business logic from the controller.
//  The controller just calls service.login() and gets back a result.
//  It doesn't need to know HOW the role check or validation works.
//
//  OOP Concept → ENCAPSULATION
//  All logic is private inside this class. Only the public methods
//  are visible to the controller.
// ─────────────────────────────────────────────────────────────────

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // ── Login result constants ───────────────────────────────────
    public static final String RESULT_ADMIN    = "ADMIN";
    public static final String RESULT_CUSTOMER = "CUSTOMER";
    public static final String RESULT_INVALID  = "INVALID";

    // ════════════════════════════════════════════════════════════
    //  LOGIN — checks credentials and returns who the user is
    // ════════════════════════════════════════════════════════════

    /**
     * Returns "ADMIN"    → valid login, user is admin
     * Returns "CUSTOMER" → valid login, user is customer
     * Returns "INVALID"  → wrong username or password
     */
    public String login(String username, String password) {

        // Step 1 — find user by username
        User user = userRepository.findByUsername(username);

        // Step 2 — check if user exists
        if (user == null) {
            return RESULT_INVALID;
        }

        // Step 3 — check if password matches
        if (!user.getPassword().equals(password)) {
            return RESULT_INVALID;
        }

        // Step 4 — return role so controller knows where to redirect
        if ("ADMIN".equals(user.getRole())) {
            return RESULT_ADMIN;
        } else {
            return RESULT_CUSTOMER;
        }
    }

    // ════════════════════════════════════════════════════════════
    //  GET USER — fetch the full User object after login succeeds
    // ════════════════════════════════════════════════════════════

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    // ════════════════════════════════════════════════════════════
    //  REGISTER — validates and saves a new user
    // ════════════════════════════════════════════════════════════

    /**
     * Returns null          → registration successful
     * Returns error message → something went wrong
     */
    public String register(String username, String password,
                           String email,    String telephone,
                           String firstName, String lastName) {

        // Check username not already taken
        if (userRepository.findByUsername(username) != null) {
            return "Username already exists!";
        }

        // Check email not already registered
        if (userRepository.findByEmail(email) != null) {
            return "Email is already registered!";
        }

        // Check required fields not blank
        if (username.isBlank() || password.isBlank() || email.isBlank()) {
            return "Username, password and email are required!";
        }

        // All checks passed — save new user
        User newUser = new User();
        newUser.setUsername(username);
        newUser.setPassword(password);
        newUser.setEmail(email);
        newUser.setTelephone(telephone);
        newUser.setFirstName(firstName.isBlank() ? username : firstName);
        newUser.setLastName(lastName);
        newUser.setRole("CUSTOMER");   // all self-registrations = CUSTOMER

        userRepository.save(newUser);
        return null;   // null = success
    }

    // ════════════════════════════════════════════════════════════
    //  UPDATE — update an existing user's profile
    // ════════════════════════════════════════════════════════════

    /**
     * Returns null          → update successful
     * Returns error message → user not found
     */
    public String updateUser(Long userId, String email, String password,
                             String telephone, String firstName, String lastName) {

        User user = userRepository.findById(userId).orElse(null);

        if (user == null) {
            return "User not found!";
        }

        if (!email.isBlank())     user.setEmail(email);
        if (!password.isBlank())  user.setPassword(password);
        if (!telephone.isBlank()) user.setTelephone(telephone);
        if (!firstName.isBlank()) user.setFirstName(firstName);
        if (!lastName.isBlank())  user.setLastName(lastName);

        userRepository.save(user);
        return null;   // null = success
    }

    // ════════════════════════════════════════════════════════════
    //  DELETE — remove a user by id
    // ════════════════════════════════════════════════════════════

    public boolean deleteUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            return false;
        }
        userRepository.deleteById(userId);
        return true;
    }
}
