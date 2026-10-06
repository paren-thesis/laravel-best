<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid email or password credentials.'
            ], 401);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        AuditLogger::log('user.login', "User {$user->name} ({$user->email}) logged in.", $user);

        return response()->json([
            'message' => 'Login successful',
            'access_token' => $token,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames(),
                'profile' => $user->profile?->load('course'),
                'supervisor_profile' => $user->supervisorProfile,
            ]
        ]);
    }

    public function me(Request $request)
    {
        $user = $request->user()->load(['profile.course', 'supervisorProfile']);

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames(),
                'profile' => $user->profile,
                'supervisor_profile' => $user->supervisorProfile,
            ]
        ]);
    }

    public function logout(Request $request)
    {
        $user = $request->user();
        if ($user) {
            AuditLogger::log('user.logout', "User {$user->name} ({$user->email}) logged out.", $user);
            $user->currentAccessToken()->delete();
        }

        return response()->json([
            'message' => 'Successfully logged out'
        ]);
    }
}
