package com.bakery.service;

import com.bakery.model.Product;
import com.bakery.repository.ProductRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository repository;

    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }

    // ── GET ALL ───────────────────────────────────
    public List<Product> getAllProducts() {
        return repository.findAll();
    }

    // ── GET ONE ───────────────────────────────────
    public Product getProductById(Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Product not found: " + id));
    }

    // ── ADD NEW ───────────────────────────────────
    public Product addProduct(Product product) {
        if (product.getStockQuantity() > 0) {
            product.setAvailable(true);
        } else {
            product.setAvailable(false);
        }
        return repository.save(product);
    }

    // ── UPDATE ────────────────────────────────────
    public Product updateProduct(Long id, Product updated) {
        Product existing = getProductById(id);
        existing.setName(updated.getName());
        existing.setCategory(updated.getCategory());
        existing.setDescription(updated.getDescription());
        existing.setPrice(updated.getPrice());
        existing.setImageUrl(updated.getImageUrl());
        existing.setStockQuantity(updated.getStockQuantity());
        existing.setAvailable(updated.getStockQuantity() > 0);
        return repository.save(existing);
    }

    // ── DELETE ────────────────────────────────────
    public void deleteProduct(Long id) {
        repository.deleteById(id);
    }

    // ── SEARCH ────────────────────────────────────
    public List<Product> searchProducts(String keyword) {
        return repository
                .findByNameContainingIgnoreCase(keyword);
    }

    // ── FILTER BY CATEGORY ────────────────────────
    public List<Product> getByCategory(String category) {
        return repository
                .findByCategoryAndAvailable(category, true);
    }

    // ── SORT BY PRICE ─────────────────────────────
    public List<Product> sortByPrice(String order) {
        List<Product> all = repository.findAll();
        if (order.equals("asc")) {
            return all.stream()
                    .sorted(Comparator.comparing(Product::getPrice))
                    .collect(Collectors.toList());
        } else {
            return all.stream()
                    .sorted(Comparator.comparing(
                            Product::getPrice).reversed())
                    .collect(Collectors.toList());
        }
    }
}