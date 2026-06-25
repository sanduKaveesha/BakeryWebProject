// ============================================================
//  Sweet Crumbs – shared data (mirrors lib/data.ts)
//  Replace fetch() calls with your Java backend endpoints
// ============================================================

const products = [
  { id:1, name:"Classic Chocolate Cake",   description:"Rich dark chocolate layers with silky ganache frosting, topped with chocolate shavings.", price:45.00, category:"cake",    image:"images/chocolate-cake.jpg", rating:4.8, inStock:true  },
  { id:2, name:"Vanilla Dream Cake",        description:"Light vanilla sponge with whipped buttercream and fresh seasonal berries.",               price:42.00, category:"cake",    image:"images/vanilla-cake.jpg",   rating:4.7, inStock:true  },
  { id:3, name:"Red Velvet Delight",        description:"Moist red velvet layers with cream cheese frosting, a timeless classic.",                  price:48.00, category:"cake",    image:"images/red-velvet.jpg",     rating:4.9, inStock:true  },
  { id:4, name:"Butter Croissant",          description:"Flaky, golden layers of buttery pastry, baked fresh every morning.",                       price:4.50,  category:"pastry",  image:"images/croissant.jpg",      rating:4.6, inStock:true  },
  { id:5, name:"Assorted Pastry Box",       description:"A curated selection of our finest danishes, tarts, and puff pastries.",                    price:28.00, category:"pastry",  image:"images/pastries.jpg",       rating:4.5, inStock:true  },
  { id:6, name:"Artisan Cookie Box",        description:"Handcrafted cookies including chocolate chip, macarons, and butter cookies.",               price:22.00, category:"cookies", image:"images/cookies.jpg",        rating:4.7, inStock:true  },
  { id:7, name:"Strawberry Shortcake",      description:"Fluffy vanilla cake layered with fresh strawberries and whipped cream.",                    price:40.00, category:"cake",    image:"images/vanilla-cake.jpg",   rating:4.6, inStock:true  },
  { id:8, name:"Almond Croissant",          description:"Classic croissant filled with almond cream and topped with sliced almonds.",                price:5.50,  category:"pastry",  image:"images/croissant.jpg",      rating:4.8, inStock:false },
  { id:9, name:"Double Chocolate Cookies",  description:"Chewy dark chocolate cookies loaded with chocolate chunks and sea salt.",                   price:18.00, category:"cookies", image:"images/cookies.jpg",        rating:4.9, inStock:true  },
];

const sampleOrders = [
  { id:1001, items:[{product:products[0],quantity:1},{product:products[3],quantity:4}], customCakes:[], total:63.00, status:"confirmed", createdAt:"2026-03-01T10:30:00Z", customerName:"Sarah Johnson",  customerEmail:"sarah@example.com",   deliveryAddress:"123 Main St, Springfield" },
  { id:1002, items:[{product:products[2],quantity:1}], customCakes:[{id:1,size:"10 inch",flavor:"Vanilla",theme:"Wedding",message:"Happily Ever After",deliveryDate:"2026-03-15",status:"baking",price:120.00}], total:168.00, status:"baking",     createdAt:"2026-03-02T14:15:00Z", customerName:"Michael Chen",   customerEmail:"michael@example.com",  deliveryAddress:"456 Oak Ave, Riverside"   },
  { id:1003, items:[{product:products[5],quantity:2},{product:products[4],quantity:1}], customCakes:[], total:72.00, status:"pending",   createdAt:"2026-03-03T09:00:00Z", customerName:"Emily Davis",    customerEmail:"emily@example.com",   deliveryAddress:"789 Pine Rd, Lakeview"   },
  { id:1004, items:[{product:products[1],quantity:2}], customCakes:[], total:84.00, status:"delivered",  createdAt:"2026-02-28T16:45:00Z", customerName:"James Wilson",   customerEmail:"james@example.com",   deliveryAddress:"321 Elm St, Fairview"    },
  { id:1005, items:[], customCakes:[{id:2,size:"12 inch",flavor:"Chocolate",theme:"Birthday",message:"Happy 30th Birthday!",deliveryDate:"2026-03-10",status:"pending",price:95.00}], total:95.00, status:"ready", createdAt:"2026-03-01T11:00:00Z", customerName:"Lisa Brown", customerEmail:"lisa@example.com", deliveryAddress:"654 Maple Dr, Greenfield" },
];

const sampleUsers = [
  { id:1, name:"Sarah Johnson", email:"sarah@example.com",       role:"USER",  phone:"+1 555-0101", address:"123 Main St, Springfield",  joinedDate:"2025-06-15" },
  { id:2, name:"Michael Chen",  email:"michael@example.com",     role:"USER",  phone:"+1 555-0102", address:"456 Oak Ave, Riverside",     joinedDate:"2025-08-22" },
  { id:3, name:"Emily Davis",   email:"emily@example.com",       role:"USER",  phone:"+1 555-0103", address:"789 Pine Rd, Lakeview",      joinedDate:"2025-11-01" },
  { id:4, name:"Admin User",    email:"admin@sweetcrumbs.com",   role:"ADMIN", phone:"+1 555-0100", address:"1 Bakery Lane, Downtown",    joinedDate:"2024-01-01" },
  { id:5, name:"James Wilson",  email:"james@example.com",       role:"USER",  phone:"+1 555-0104", address:"321 Elm St, Fairview",       joinedDate:"2026-01-10" },
];

const cakeSizes = [
  { value:"6",       label:"6 inch (6-8 servings)",      price:55  },
  { value:"8",       label:"8 inch (10-12 servings)",    price:75  },
  { value:"10",      label:"10 inch (16-20 servings)",   price:95  },
  { value:"12",      label:"12 inch (24-30 servings)",   price:120 },
  { value:"tiered-2",label:"2-Tier (40-50 servings)",   price:180 },
  { value:"tiered-3",label:"3-Tier (70-90 servings)",   price:280 },
];

const cakeFlavors = ["Vanilla","Chocolate","Red Velvet","Lemon","Strawberry","Carrot","Marble","Coconut","Coffee","Funfetti"];
const cakeThemes  = ["Birthday","Wedding","Anniversary","Baby Shower","Graduation","Holiday","Floral","Minimalist","Rustic","Elegant","Cartoon Character","Sports"];

// ── helpers ──────────────────────────────────────────────────
function statusBadgeClass(status) {
  const map = {
    pending:"bg-warning text-dark", confirmed:"bg-info text-white",
    baking:"bg-orange text-white",  ready:"bg-success text-white",
    delivered:"bg-success text-white", cancelled:"bg-danger text-white",
    decorating:"bg-pink text-white",
  };
  return map[status] || "bg-secondary text-white";
}

// Simple toast helper (uses Bootstrap toast)
function showToast(msg, type="success") {
  const container = document.getElementById("toastContainer");
  if (!container) return;
  const id = "t" + Date.now();
  const colorClass = type === "success" ? "text-bg-success" : type === "error" ? "text-bg-danger" : "text-bg-info";
  container.insertAdjacentHTML("beforeend", `
    <div id="${id}" class="toast align-items-center ${colorClass} border-0" role="alert">
      <div class="d-flex"><div class="toast-body">${msg}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button></div>
    </div>`);
  const el = document.getElementById(id);
  const toast = new bootstrap.Toast(el, { delay: 3000 });
  toast.show();
  el.addEventListener("hidden.bs.toast", () => el.remove());
}
