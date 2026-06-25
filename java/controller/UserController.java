package com.bakery.controller;

import com.bakery.model.User;
import com.bakery.repository.UserRepository;
import com.bakery.service.UserService;

import jakarta.servlet.http.HttpSession;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;

    // REGISTER USER (With Automatic Login)
    // POST: /api/users/register

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(
            @RequestBody User user,
            HttpSession session
    ) {

        // 1. Attempt to register the user in the database
        String error = userService.register(
                user.getUsername(),
                user.getPassword(),
                user.getEmail(),
                user.getTelephone(),
                user.getFirstName(),
                user.getLastName()
        );

        if (error != null) {
            return ResponseEntity
                    .badRequest()
                    .body(error);
        }

        // 2. Fetch the newly registered user to get database-generated fields (like ID and Role)
        User registeredUser = userService.getUserByUsername(user.getUsername());

        // 3. Create the session (Log them in automatically)
        session.setAttribute("loggedInUser", registeredUser.getUsername());
        session.setAttribute("userRole", registeredUser.getRole());
        session.setAttribute("userId", registeredUser.getId());
        session.setAttribute(
                "fullName",
                registeredUser.getFirstName() + " " + registeredUser.getLastName()
        );

        // 4. Return success response with user details so the frontend can use them immediately
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Registration and login successful");
        response.put("role", registeredUser.getRole());
        response.put("userId", registeredUser.getId());
        response.put("username", registeredUser.getUsername());
        response.put("fullName",
                registeredUser.getFirstName() + " " + registeredUser.getLastName());

        return ResponseEntity.ok(response);
    }


    // =====================================================
    // LOGIN USER
    // POST: /api/users/login
    // =====================================================

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(
            @RequestBody User user,
            HttpSession session
    ) {

        String result = userService.login(
                user.getUsername(),
                user.getPassword()
        );

        if (UserService.RESULT_INVALID.equals(result)) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("Invalid username or password");
        }

        User loggedUser = userService
                .getUserByUsername(user.getUsername());

        session.setAttribute("loggedInUser", loggedUser.getUsername());
        session.setAttribute("userRole", loggedUser.getRole());
        session.setAttribute("userId", loggedUser.getId());
        session.setAttribute(
                "fullName",
                loggedUser.getFirstName() + " " + loggedUser.getLastName()
        );

        Map<String, Object> response = new HashMap<>();

        response.put("message", "Login successful");
        response.put("role", loggedUser.getRole());
        response.put("userId", loggedUser.getId());
        response.put("username", loggedUser.getUsername());
        response.put("fullName",
                loggedUser.getFirstName() + " " + loggedUser.getLastName());

        return ResponseEntity.ok(response);
    }

    // GET USER DASHBOARD / PROFILE
    // GET: /api/users/dashboard

    @GetMapping("/dashboard")
    public ResponseEntity<?> getDashboard(HttpSession session) {

        if (session.getAttribute("loggedInUser") == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("User not logged in");
        }

        Long id = (Long) session.getAttribute("userId");

        User user = userRepository
                .findById(id)
                .orElse(null);

        if (user == null) {
            return ResponseEntity
                    .status(HttpStatus.NOT_FOUND)
                    .body("User not found");
        }

        return ResponseEntity.ok(user);
    }

    // UPDATE USER PROFILE
    // PUT: /api/users/update

    @PutMapping("/update")
    public ResponseEntity<?> updateUser(
            @RequestBody User updatedUser,
            HttpSession session
    ) {

        if (session.getAttribute("loggedInUser") == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("User not logged in");
        }

        Long id = (Long) session.getAttribute("userId");

        String error = userService.updateUser(
                id,
                updatedUser.getEmail(),
                updatedUser.getPassword(),
                updatedUser.getTelephone(),
                updatedUser.getFirstName(),
                updatedUser.getLastName()
        );

        if (error != null) {
            return ResponseEntity
                    .badRequest()
                    .body(error);
        }

        User user = userRepository
                .findById(id)
                .orElse(null);

        if (user != null) {
            session.setAttribute(
                    "fullName",
                    user.getFirstName() + " " + user.getLastName()
            );
        }

        Map<String, String> response = new HashMap<>();
        response.put("message", "Profile updated successfully");

        return ResponseEntity.ok(response);
    }


    // DELETE OWN ACCOUNT
    // DELETE: /api/users/delete

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteUser(HttpSession session) {

        if (session.getAttribute("loggedInUser") == null) {
            return ResponseEntity
                    .status(HttpStatus.UNAUTHORIZED)
                    .body("User not logged in");
        }

        Long id = (Long) session.getAttribute("userId");

        userService.deleteUser(id);

        session.invalidate();

        Map<String, String> response = new HashMap<>();
        response.put("message", "User deleted successfully");

        return ResponseEntity.ok(response);
    }


    // LOGOUT
    // POST: /api/users/logout

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {

        session.invalidate();

        Map<String, String> response = new HashMap<>();
        response.put("message", "Logged out successfully");

        return ResponseEntity.ok(response);
    }


    // ADMIN DASHBOARD
    // GET: /api/users/admin/dashboard

    @GetMapping("/admin/dashboard")
    public ResponseEntity<?> adminDashboard(HttpSession session) {

        if (!"ADMIN".equals(session.getAttribute("userRole"))) {
            return ResponseEntity
                    .status(HttpStatus.FORBIDDEN)
                    .body("Access denied");
        }

        List<User> users = userRepository.findAll();

        return ResponseEntity.ok(users);
    }

    // ADMIN DELETE USER
    // DELETE: /api/users/admin/delete-user/{id}

    @DeleteMapping("/admin/delete-user/{id}")
    public ResponseEntity<?> adminDeleteUser(
            @PathVariable Long id,
            HttpSession session
    ) {

        userService.deleteUser(id);

        Map<String, String> response = new HashMap<>();
        response.put("message", "User deleted successfully");

        return ResponseEntity.ok(response);
    }

    // GET ALL USERS
    // GET: /api/users/all

    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers(HttpSession session) {

        List<User> users = userRepository.findAll();

        return ResponseEntity.ok(users);
    }
}