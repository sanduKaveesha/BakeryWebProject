package com.bakery.controller;

import com.bakery.model.Product;
import com.bakery.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService service;

    // GET all products
    // URL: GET http://localhost:8080/api/products
    @GetMapping
    public ResponseEntity<List<Product>> getAll() {
        return ResponseEntity.ok(service.getAllProducts());
    }

    // GET single product
    // URL: GET http://localhost:8080/api/products/1
    @GetMapping("/{id}")
    public ResponseEntity<Product> getOne(
            @PathVariable Long id) {
        return ResponseEntity.ok(
                service.getProductById(id));
    }

    // GET by category
    // URL: GET http://localhost:8080/api/products/category/cake
    @GetMapping("/category/{category}")
    public ResponseEntity<List<Product>> getByCategory(
            @PathVariable String category) {
        return ResponseEntity.ok(
                service.getByCategory(category));
    }

    // GET search
    // URL: GET http://localhost:8080/api/products/search?keyword=choco
    @GetMapping("/search")
    public ResponseEntity<List<Product>> search(
            @RequestParam String keyword) {
        return ResponseEntity.ok(
                service.searchProducts(keyword));
    }

    // GET sort
    // URL: GET http://localhost:8080/api/products/sort?order=asc
    @GetMapping("/sort")
    public ResponseEntity<List<Product>> sort(
            @RequestParam String order) {
        return ResponseEntity.ok(
                service.sortByPrice(order));
    }

    // POST add product
    // URL: POST http://localhost:8080/api/products
    @PostMapping
    public ResponseEntity<Product> add(
            @RequestBody Product product) {
        return ResponseEntity.ok(
                service.addProduct(product));
    }

    // PUT update product
    // URL: PUT http://localhost:8080/api/products/1
    @PutMapping("/{id}")
    public ResponseEntity<Product> update(
            @PathVariable Long id,
            @RequestBody Product product) {
        return ResponseEntity.ok(
                service.updateProduct(id, product));
    }

    // DELETE product
    // URL: DELETE http://localhost:8080/api/products/1
    @DeleteMapping("/{id}")
    public ResponseEntity<String> delete(
            @PathVariable Long id) {
        service.deleteProduct(id);
        return ResponseEntity.ok("Product deleted!");
    }
}