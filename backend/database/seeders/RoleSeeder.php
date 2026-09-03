<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Course;
use App\Models\Semester;
use App\Models\SupervisorProfile;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Spatie Roles
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $coordinatorRole = Role::firstOrCreate(['name' => 'coordinator']);
        $supervisorRole = Role::firstOrCreate(['name' => 'supervisor']);
        $studentRole = Role::firstOrCreate(['name' => 'student']);
        $panelRole = Role::firstOrCreate(['name' => 'panel_member']);

        // 2. Create Initial Academic Session & Course
        $year = AcademicYear::firstOrCreate(
            ['name' => '2025/2026'],
            ['is_current' => true, 'start_date' => '2025-09-01', 'end_date' => '2026-06-30']
        );

        Semester::firstOrCreate(
            ['academic_year_id' => $year->id, 'name' => 'Semester 1'],
            ['is_current' => true]
        );

        $course = Course::firstOrCreate(
            ['code' => 'HND-CS'],
            ['name' => 'HND Computer Science', 'department' => 'Computer Science']
        );

        // 3. Create Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@htu.edu.gh'],
            [
                'name' => 'System Admin',
                'password' => Hash::make('password'),
            ]
        );
        $admin->assignRole($adminRole);
        UserProfile::firstOrCreate(['user_id' => $admin->id], ['staff_id' => 'STAFF-ADMIN']);

        // 4. Create Coordinator User
        $coordinator = User::firstOrCreate(
            ['email' => 'coordinator@htu.edu.gh'],
            [
                'name' => 'Dr. Coordinator',
                'password' => Hash::make('password'),
            ]
        );
        $coordinator->assignRole($coordinatorRole);
        UserProfile::firstOrCreate(['user_id' => $coordinator->id], ['staff_id' => 'STAFF-COORD']);

        // 5. Create Supervisor User
        $supervisor = User::firstOrCreate(
            ['email' => 'supervisor@htu.edu.gh'],
            [
                'name' => 'Prof. Supervisor',
                'password' => Hash::make('password'),
            ]
        );
        $supervisor->assignRole($supervisorRole);
        UserProfile::firstOrCreate(['user_id' => $supervisor->id], ['staff_id' => 'STAFF-SUP01']);
        SupervisorProfile::firstOrCreate(
            ['user_id' => $supervisor->id],
            ['max_team_capacity' => 5, 'current_team_count' => 0, 'research_interests' => ['Web Systems', 'AI', 'Cloud']]
        );

        // 6. Create Demo Student User
        $student = User::firstOrCreate(
            ['email' => 'student@htu.edu.gh'],
            [
                'name' => 'John Doe (Student Leader)',
                'password' => Hash::make('password'),
            ]
        );
        $student->assignRole($studentRole);
        UserProfile::firstOrCreate(
            ['user_id' => $student->id],
            ['index_number' => '042023001', 'course_id' => $course->id, 'phone' => '0240000000']
        );
    }
}
