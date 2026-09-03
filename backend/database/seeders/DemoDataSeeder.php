<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Course;
use App\Models\DefensePanel;
use App\Models\Evaluation;
use App\Models\PeerEvaluation;
use App\Models\Rubric;
use App\Models\RubricCriteria;
use App\Models\Semester;
use App\Models\SoftwareDeliverable;
use App\Models\Supervision;
use App\Models\SupervisorProfile;
use App\Models\Team;
use App\Models\TeamMember;
use App\Models\Topic;
use App\Models\User;
use App\Models\UserProfile;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Faker\Factory as Faker;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $faker = Faker::create();

        // 1. Roles
        $studentRole = Role::firstOrCreate(['name' => 'student']);
        $supervisorRole = Role::firstOrCreate(['name' => 'supervisor']);
        $coordinatorRole = Role::firstOrCreate(['name' => 'coordinator']);
        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $panelRole = Role::firstOrCreate(['name' => 'panel_member']);

        // 2. Academic Session & Courses
        $year = AcademicYear::firstOrCreate(
            ['name' => '2025/2026'],
            ['is_current' => true, 'start_date' => '2025-09-01', 'end_date' => '2026-06-30']
        );

        Semester::firstOrCreate(
            ['academic_year_id' => $year->id, 'name' => 'Semester 1'],
            ['is_current' => true]
        );

        $hndCs = Course::firstOrCreate(
            ['code' => 'HND-CS'],
            ['name' => 'HND Computer Science', 'department' => 'Computer Science']
        );

        $btechCs = Course::firstOrCreate(
            ['code' => 'BTECH-CS'],
            ['name' => 'BTech Computer Science', 'department' => 'Computer Science']
        );

        // 3. Create 6 Supervisors
        $supervisors = [];
        $supervisorNames = [
            'Prof. Eric Mensah',
            'Dr. Patricia Addo',
            'Ing. Samuel Osei',
            'Dr. Hannah Appiah',
            'Prof. Michael Baah',
            'Dr. Grace Kpodo'
        ];

        foreach ($supervisorNames as $i => $name) {
            $user = User::firstOrCreate(
                ['email' => 'supervisor' . ($i + 1) . '@htu.edu.gh'],
                [
                    'name' => $name,
                    'password' => Hash::make('password'),
                ]
            );
            $user->assignRole($supervisorRole);
            UserProfile::firstOrCreate(['user_id' => $user->id], ['staff_id' => 'SUP-00' . ($i + 1)]);
            SupervisorProfile::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'max_team_capacity' => 5,
                    'current_team_count' => 0,
                    'research_interests' => $faker->randomElements(['AI/ML', 'Cloud Computing', 'Web Security', 'IoT', 'Mobile Apps', 'Data Science'], 3)
                ]
            );
            $supervisors[] = $user;
        }

        // 4. Create 30 Students (Offset index numbers to avoid collisions)
        $students = [];
        for ($i = 1; $i <= 30; $i++) {
            $student = User::firstOrCreate(
                ['email' => "student{$i}@htu.edu.gh"],
                [
                    'name' => $faker->name(),
                    'password' => Hash::make('password'),
                ]
            );
            $student->assignRole($studentRole);

            $indexNum = '042023' . sprintf('%03d', $i + 100);

            UserProfile::firstOrCreate(
                ['user_id' => $student->id],
                [
                    'index_number' => $indexNum,
                    'course_id' => ($i % 2 === 0) ? $btechCs->id : $hndCs->id,
                    'phone' => '024' . $faker->numerify('#######'),
                ]
            );
            $students[] = $student;
        }

        // 5. Create 8 Student Teams (3-4 students per team)
        $teamNames = [
            'Team Alpha (AI Grade)',
            'Team Vision (IoT Farm)',
            'Team Cyber (BlockCert)',
            'Team Health (TeleMed)',
            'Team EcoTech (Solar Grid)',
            'Team DataPulse (Analytics)',
            'Team SecureNet (Biometrics)',
            'Team EduLearn (LMS Portal)'
        ];
        $teams = [];

        foreach ($teamNames as $idx => $tName) {
            $teamStudents = array_slice($students, $idx * 3, 3);
            if (empty($teamStudents)) break;
            $leader = $teamStudents[0];

            $team = Team::create([
                'name' => $tName,
                'course_id' => ($idx % 2 === 0) ? $hndCs->id : $btechCs->id,
                'academic_year_id' => $year->id,
                'max_members' => 4,
                'created_by_user_id' => $leader->id,
            ]);

            foreach ($teamStudents as $pos => $s) {
                TeamMember::create([
                    'team_id' => $team->id,
                    'user_id' => $s->id,
                    'role_in_team' => ($pos === 0) ? 'leader' : 'member',
                ]);
            }
            $teams[] = $team;
        }

        // 6. Topics for Teams
        $sampleTopics = [
          [
             'title' => 'AI-Powered Automated Code Grading & Plagiarism Detection System',
             'abstract' => 'An intelligent web platform that automatically compiles, tests, and checks code submissions for student programming assignments using containerized microservices.',
             'problem' => 'Manual evaluation of programming assignments in large computer science classes is slow and prone to subjective grading inconsistencies.',
             'solution' => 'A React and Laravel web application utilizing Docker sandbox runners and machine learning code similarity analysis.',
             'status' => 'approved',
             'tech' => ['React', 'Laravel', 'Docker', 'Python', 'Tailwind']
          ],
          [
             'title' => 'IoT Smart Farm Monitoring and Automated Crop Irrigation System',
             'abstract' => 'An IoT system combining sensor nodes, microcontrollers, and a cloud telemetry dashboard for monitoring soil moisture and climate parameters.',
             'problem' => 'Farmers in Ghana face low crop yield due to unpredictable weather patterns and inefficient manual irrigation techniques.',
             'solution' => 'ESP32 sensor nodes connected to a Laravel and MQTT backend providing real-time mobile alerts and automated pump control.',
             'status' => 'approved',
             'tech' => ['C++', 'ESP32', 'Laravel', 'MQTT', 'Chart.js']
          ],
          [
             'title' => 'Blockchain-Based Verification Engine for HTU Academic Certificates',
             'abstract' => 'A decentralized verification system ensuring academic credentials and transcripts issued by Ho Technical University are tamper-proof.',
             'problem' => 'Certificate forgery and slow manual verification processes for employers seeking background checks.',
             'solution' => 'Ethereum smart contracts linked to a web portal where employers scan QR codes to instantly verify graduate certificates.',
             'status' => 'under_review',
             'tech' => ['Solidity', 'Web3.js', 'React', 'Node.js']
          ],
          [
             'title' => 'Mobile Telemedicine & Specialist Appointment Booking Portal',
             'abstract' => 'A comprehensive digital healthcare management platform connecting rural patients with medical specialists across Ghana.',
             'problem' => 'Patients in remote communities travel long distances to access hospital specialist consultations.',
             'solution' => 'Flutter mobile application integrated with WebRTC video calling, online payments, and digital prescription tracking.',
             'status' => 'submitted',
             'tech' => ['Flutter', 'WebRTC', 'Laravel', 'Paystack']
          ],
          [
             'title' => 'Smart Solar Micro-Grid Remote Monitoring & Metering Portal',
             'abstract' => 'Real-time telemetry dashboard monitoring battery state-of-charge and solar panel power distribution for commercial micro-grids.',
             'problem' => 'Commercial solar installations lack centralized remote monitoring of battery degradation and energy distribution.',
             'solution' => 'React Dashboard connected to WebSockets telemetry engine with automated load shedding triggers.',
             'status' => 'approved',
             'tech' => ['React', 'Node.js', 'WebSockets', 'Chart.js']
          ],
          [
             'title' => 'Predictive Student Performance Analytics & Early Intervention System',
             'abstract' => 'Machine learning analytics dashboard identifying students at risk of academic probation using historical assessment data.',
             'problem' => 'Academic advisors discover struggling students late after end-of-semester final examinations.',
             'solution' => 'Random Forest classification model trained on assessment scores integrated into a Laravel advisor dashboard.',
             'status' => 'under_review',
             'tech' => ['Python', 'Scikit-Learn', 'Laravel', 'Tailwind']
          ],
          [
             'title' => 'Biometric Fingerprint Attendance Verification for HTU Examinations',
             'abstract' => 'Hardware-integrated examination hall attendance verification system replacing manual paper sign-in sheets.',
             'problem' => 'Student impersonation and proxy exam writing during large end-of-semester examinations.',
             'solution' => 'Fingerprint biometric scanner communicating via encrypted API to student registry database.',
             'status' => 'submitted',
             'tech' => ['C++', 'Fingerprint SDK', 'Laravel', 'MySQL']
          ],
          [
             'title' => 'Interactive Offline-First Learning Management System for Rural Schools',
             'abstract' => 'Offline PWA learning management system enabling students in low-connectivity regions to sync coursework when online.',
             'problem' => 'Intermittent internet connectivity interrupts digital learning for students in rural Ghana.',
             'solution' => 'Progressive Web App using IndexedDB local storage and background sync service workers.',
             'status' => 'draft',
             'tech' => ['PWA', 'IndexedDB', 'React', 'Service Workers']
          ],
        ];

        foreach ($teams as $k => $t) {
            $topicData = $sampleTopics[$k % count($sampleTopics)];
            Topic::create([
                'team_id' => $t->id,
                'title' => $topicData['title'],
                'abstract' => $topicData['abstract'],
                'problem_statement' => $topicData['problem'],
                'proposed_solution' => $topicData['solution'],
                'tech_stack' => $topicData['tech'],
                'status' => $topicData['status'],
                'submitted_at' => now()->subDays(12 - $k),
                'reviewed_at' => ($topicData['status'] === 'approved') ? now()->subDays(4) : null,
            ]);

            // Assign Supervisor to Team
            $sup = $supervisors[$k % count($supervisors)];
            Supervision::create([
                'team_id' => $t->id,
                'supervisor_id' => $sup->id,
                'academic_year_id' => $year->id,
                'status' => 'active',
            ]);

            // Create Software Deliverables
            SoftwareDeliverable::create([
                'team_id' => $t->id,
                'github_repository_url' => "https://github.com/htu-cs/team-" . ($k + 1) . "-fyp",
                'google_drive_url' => "https://drive.google.com/drive/folders/htu-fyp-team-" . ($k + 1),
                'environment_details' => "Docker compose setup instructions in README. Test Credentials: admin@demo.com / secret123",
                'submitted_by_user_id' => $t->members->first()->id,
            ]);

            // Create Peer Evaluations among teammates
            $mems = $t->members;
            foreach ($mems as $e1) {
                foreach ($mems as $e2) {
                    if ($e1->id !== $e2->id) {
                        PeerEvaluation::create([
                            'team_id' => $t->id,
                            'evaluator_id' => $e1->id,
                            'evaluatee_id' => $e2->id,
                            'score' => rand(8, 10),
                            'comments' => $faker->randomElement([
                                'Great team player, met all coding deadlines promptly.',
                                'Exceptional contribution to system architecture and database design.',
                                'Punctual at all group meetings and prepared detailed documentation.'
                            ]),
                            'submitted_at' => now()->subDays(2),
                        ]);
                    }
                }
            }
        }

        // 7. Defense Rubric & Criteria
        $rubric = Rubric::create([
            'title' => 'Final Year Defense Assessment Rubric',
            'max_score' => 100,
            'is_active' => true,
        ]);

        $c1 = RubricCriteria::create([
            'rubric_id' => $rubric->id,
            'title' => 'Technical Architecture & Code Quality',
            'description' => 'Evaluates database design, API security, design patterns, and code structure.',
            'max_points' => 30,
        ]);

        $c2 = RubricCriteria::create([
            'rubric_id' => $rubric->id,
            'title' => 'System Demonstration & Functionality',
            'description' => 'Evaluates live system demonstration, error handling, and user interface UX.',
            'max_points' => 35,
        ]);

        $c3 = RubricCriteria::create([
            'rubric_id' => $rubric->id,
            'title' => 'Presentation & Technical Q&A Defense',
            'description' => 'Evaluates presentation clarity, domain understanding, and responses to panel questions.',
            'max_points' => 35,
        ]);

        // 8. Defense Panel & Evaluators
        $panel = DefensePanel::create([
            'name' => 'Panel A — Software Systems & Artificial Intelligence',
            'scheduled_at' => now()->addDays(7),
            'location' => 'CS Lab 2, HTU Main Campus',
            'academic_year_id' => $year->id,
        ]);

        // Attach panel members via Eloquent relationship
        $panel->members()->attach($supervisors[0]->id, ['role' => 'chair']);
        $panel->members()->attach($supervisors[1]->id, ['role' => 'evaluator']);

        // Add evaluations for Team 1
        Evaluation::create([
            'team_id' => $teams[0]->id,
            'panel_id' => $panel->id,
            'evaluator_id' => $supervisors[0]->id,
            'rubric_id' => $rubric->id,
            'rubric_criteria_id' => $c1->id,
            'score' => 28,
            'comments' => 'Excellent database schema and clean REST API structure.',
        ]);

        Evaluation::create([
            'team_id' => $teams[0]->id,
            'panel_id' => $panel->id,
            'evaluator_id' => $supervisors[0]->id,
            'rubric_id' => $rubric->id,
            'rubric_criteria_id' => $c2->id,
            'score' => 33,
            'comments' => 'Live demonstration succeeded without runtime exceptions.',
        ]);
    }
}
