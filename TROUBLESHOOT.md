# **Troubleshooting & Diagnostic Guide — HTU FYP System**

This document provides step-by-step diagnostic procedures and solutions for common errors encountered during local setup or deployment.

---

## **1. `ErrorException: tempnam(): file created in system's temporary directory`**

### **Symptom:**
Laravel throws HTTP 500 error:
`ErrorException: tempnam(): file created in the system's temporary directory at /var/www/html/vendor/laravel/framework/src/Illuminate/Filesystem/Filesystem.php:222`

### **Cause:**
The view compilation directory `/var/www/html/storage/framework/views` inside the PHP container is missing or lacks write permissions for the PHP-FPM worker process.

### **Solution:**
Run this single command in PowerShell to create all framework cache directories and grant full permissions:
```powershell
docker exec fyp_app sh -c "mkdir -p storage/framework/views storage/framework/cache/data storage/framework/sessions && chmod -R 777 storage bootstrap/cache"
docker exec fyp_app php artisan view:clear
```

---

## **2. Frontend `ERR_EMPTY_RESPONSE` or `ENOTEMPTY` Rename Error (`node_modules`)**

### **Symptom:**
Opening `http://localhost:5173` returns `ERR_EMPTY_RESPONSE` or `docker compose logs frontend` shows:
`npm error ENOTEMPTY: directory not empty, rename '/app/node_modules/jiti' -> '/app/node_modules/.jiti-xxxxx'`

### **Cause:**
Windows host filesystem file locking locks files inside `frontend/node_modules/`, blocking the Linux Docker container's `npm install` command.

### **Solution:**
Ensure `docker-compose.yml` uses an isolated container volume for `node_modules`:
```yaml
  frontend:
    volumes:
      - ./frontend:/app
      - /app/node_modules
```
Then recreate the frontend container in PowerShell:
```powershell
docker compose up -d --force-recreate frontend
```

---

## **3. Database Seeding `Duplicate entry '042023001'` (Unique Constraint Error)**

### **Symptom:**
Running `php artisan db:seed` throws:
`SQLSTATE[23000]: Integrity constraint violation: 1062 Duplicate entry '042023001' for key 'user_profiles.user_profiles_index_number_unique'`

### **Cause:**
`RoleSeeder` creates a default student with index number `042023001`, causing a collision when `DemoDataSeeder` attempts to seed index number `042023001`.

### **Solution:**
Refresh the database using `migrate:fresh`, which cleanly drops all tables before re-seeding with offset index numbers (`042023101`+):
```powershell
docker exec fyp_app php artisan migrate:fresh --seed
```

---

## **4. `Class "App\Models\DefensePanelMember" not found` or `Unknown column defense_panel_id`**

### **Symptom:**
Database seeding fails with `Unknown column defense_panel_id in field list`.

### **Cause:**
Eloquent defaults to deriving foreign key names from the class name (`DefensePanel` $\rightarrow$ `defense_panel_id`), whereas the migration table uses `panel_id`.

### **Solution:**
Specify `'panel_id'` explicitly in [`DefensePanel.php`](file:///c:/Users/DELL/Desktop/SW/HTU-Folders/laravel-best/backend/app/Models/DefensePanel.php):
```php
public function members()
{
    return $this->belongsToMany(User::class, 'defense_panel_members', 'panel_id', 'user_id')
                ->withPivot('role')
                ->withTimestamps();
}
```

---

## **5. `composer require laravel/horizon` Fails with Missing `ext-pcntl`**

### **Symptom:**
Running `composer require laravel/horizon` throws:
`laravel/horizon requires ext-pcntl * -> it is missing from your system.`

### **Cause:**
Process Control extension (`pcntl`) is checked by Composer platform requirements during CLI installation.

### **Solution:**
Pass the `--ignore-platform-req=ext-pcntl` flag to Composer in PowerShell:
```powershell
docker exec fyp_app composer require laravel/horizon --ignore-platform-req=ext-pcntl
docker exec fyp_app php artisan horizon:install
```

---

## **6. `ws://localhost:6001` Returns `ERR_UNKNOWN_URL_SCHEME` in Browser**

### **Symptom:**
Entering `ws://localhost:6001` in the Chrome address bar displays `ERR_UNKNOWN_URL_SCHEME`.

### **Cause:**
`ws://` is the WebSocket transport protocol designed for background JavaScript client connections (`new WebSocket()`), not standard HTTP browser navigation.

### **Solution:**
To check Soketi health in a browser address bar, use **`http://`** instead of `ws://`:
👉 [`http://localhost:6001`](http://localhost:6001)

It will return: `{"app":"Soketi","status":"OK"}`.

---

## **7. Red Warnings under Imports in VS Code (`Cannot find module 'react'`)**

### **Symptom:**
VS Code underlines `import React from 'react'` in red squigglies on Windows.

### **Cause:**
`node_modules` is installed inside the Docker container, not on the Windows host C: drive.

### **Solution:**
This is **100% normal** and does not affect Docker. If you want VS Code host autocompletion, run `npm install` inside the `frontend/` folder on Windows (requires local Node.js).
