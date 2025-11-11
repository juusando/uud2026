import PocketBase from "pocketbase";

// Initialize PocketBase client with the provided URL
// Note: Using HTTP instead of HTTPS due to SSL certificate issues with pb01.uud.io
const pb = new PocketBase("https://pb01.uud.io/");
// const pb = new PocketBase("http://localhost:8090");

// Helper function to get file URL for user avatar
export const getUserAvatarUrl = (user, filename) => {
  if (!user || !filename) return null;

  // For now, let's try a direct approach without using pb.files.getUrl
  // which might be causing CORS issues
  const baseUrl = "https://pb01.uud.io";
  const collectionName = "users"; // assuming users collection
  const recordId = user.id;

  const url = `${baseUrl}/api/files/${collectionName}/${recordId}/${filename}`;
  console.log("Generated avatar URL:", url);
  return url;
};

// Alternative function to fetch avatar as blob to bypass CORS
// Get avatar as blob to bypass CORS issues
export const getAvatarBlob = async (user, filename) => {
  console.log("=== getAvatarBlob DEEP DEBUG ===");
  console.log("Input user:", JSON.stringify(user, null, 2));
  console.log("Input filename:", filename);
  console.log("PocketBase client:", pb);
  console.log("PocketBase authStore:", pb.authStore);
  console.log("Is authenticated:", pb.authStore.isValid);
  console.log("Auth token:", pb.authStore.token);

  if (!user || !filename) {
    console.log("Missing user or filename, returning null");
    return null;
  }

  try {
    // SOLUTION: Use the correct collection name for user authentication
    // PocketBase typically uses '_pb_users_auth_' for user authentication records
    let fileUrl;

    // Try the PocketBase built-in method first
    try {
      fileUrl = pb.files.getUrl(user, filename);
      console.log("pb.files.getUrl result:", fileUrl);
    } catch (urlError) {
      console.error("pb.files.getUrl failed:", urlError);

      // Manual construction with correct collection name
      // PocketBase auth users are typically stored in '_pb_users_auth_' collection
      const collectionName =
        user.collectionName || user.collectionId || "_pb_users_auth_";
      fileUrl = `${pb.baseUrl}/api/files/${collectionName}/${user.id}/${filename}`;
      console.log(
        "Manual URL construction with collection:",
        collectionName,
        "-> URL:",
        fileUrl,
      );
    }

    console.log("Final file URL:", fileUrl);
    return fileUrl;
  } catch (error) {
    console.error("getAvatarBlob error:", error);
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);

    // Fallback: try multiple collection name possibilities
    const possibleCollections = [
      "_pb_users_auth_",
      "users",
      user.collectionName,
      user.collectionId,
    ].filter(Boolean);

    console.log("Trying fallback collections:", possibleCollections);

    for (const collection of possibleCollections) {
      try {
        const fallbackUrl = `${pb.baseUrl}/api/files/${collection}/${user.id}/${filename}`;
        console.log("Trying fallback URL:", fallbackUrl);
        return fallbackUrl;
      } catch (fallbackError) {
        console.log("Fallback failed for collection:", collection);
      }
    }

    console.error("All fallback attempts failed");
    return null;
  }
};

// Removed: create dummy user utility

//

// Function to register a new user with form data
export const registerUser = async (formData) => {
  try {
    console.log("Attempting to register user with data:");
    console.log(formData);
    // Log FormData contents (mask password)
    let email = "";
    for (let [key, value] of formData.entries()) {
      if (key === "email") {
        email = value;
      }
      if (key === "password" || key === "passwordConfirm") {
        console.log(`${key}: [MASKED]`);
      } else {
        console.log(`${key}:`, value);
      }
    }

    const record = await pb.collection("users").create(formData);
    console.log("User registered successfully:", record);
    console.log("Available fields:", Object.keys(record));

    // Send email verification after successful registration
    try {
      console.log("Attempting to send email verification to:", record);
      console.log("PocketBase URL:", pb.baseUrl);
      console.log("User record ID:", record.id);

      // Check if email verification is enabled in PocketBase settings
      const verificationResult = await pb
        .collection("users")
        .requestVerification(email);
      console.log("Email verification sent successfully:", verificationResult);

      // Store credentials temporarily for auto-login after verification
      try {
        const pendingEmail = record.email || formData.get("email");
        const pendingPassword = formData.get("password");
        if (pendingEmail && pendingPassword) {
          localStorage.setItem("pb_pending_email", pendingEmail);
          localStorage.setItem("pb_pending_password", pendingPassword);
        }
      } catch (storageErr) {
        console.warn("Could not store pending credentials:", storageErr);
      }

      // Update success message to mention email verification
      return {
        success: true,
        data: record,
        message:
          "Registration successful! Please check your email for verification.",
      };
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      console.error("Email error details:", {
        status: emailError.status,
        message: emailError.message,
        data: emailError.data,
        originalError: emailError.originalError,
      });

      // Check if it's a configuration issue (HTTP 400)
      if (emailError.status === 400) {
        console.warn(
          "Email verification may not be properly configured in PocketBase admin panel",
        );
        console.warn(
          "Please check: Settings > Mail settings > Email verification template",
        );
      }

      // Don't fail the registration if email sending fails - this is optional functionality
    }

    // Do not auto-login until verification is completed
    return { success: true, data: record };
  } catch (error) {
    console.error("Error registering user:", error);

    // Enhanced error handling
    let errorMessage = error.message;
    if (error.status === 400) {
      errorMessage = "Invalid data provided. Please check all fields.";
      if (error.data && error.data.data) {
        const validationErrors = Object.entries(error.data.data)
          .map(
            ([field, errors]) =>
              `${field}: ${errors.message || errors.join(", ")}`,
          )
          .join("; ");
        errorMessage += ` Details: ${validationErrors}`;
      }
    } else if (error.status === 403) {
      errorMessage = "Registration not allowed. Please contact administrator.";
    } else if (error.status === 500) {
      errorMessage = "Server error. Please try again later.";
    }

    return { success: false, error: errorMessage };
  }
};

// Function to login a user
export const loginUser = async (identifier, password) => {
  try {
    console.log("Attempting to login user with identifier:", identifier);
    const authData = await pb
      .collection("users")
      .authWithPassword(identifier, password);
    console.log("Login successful:", authData);
    return { success: true, data: authData.record };
  } catch (error) {
    console.error("Login failed:", error);
    let errorMessage = error.message;

    if (error.status === 400) {
      errorMessage = "Invalid email/username or password";
    } else if (error.status === 403) {
      errorMessage = "Account not verified or access denied";
    }

    return { success: false, error: errorMessage };
  }
};

// Function to logout the current user
export const logoutUser = () => {
  pb.authStore.clear();
  console.log("User logged out successfully");
};

// Function to get the current authenticated user
export const getCurrentUser = () => {
  return pb.authStore.model;
};

// Function to check if user is authenticated
export const isAuthenticated = () => {
  return pb.authStore.isValid;
};

// Function to update user profile
export const updateUser = async (userId, updateData) => {
  try {
    console.log("=== DEEP DEBUG: UPDATE USER PROFILE ===");
    console.log("User ID:", userId);
    console.log("Update Data:", updateData);
    console.log("Has avatarFile:", !!updateData.avatarFile);
    console.log("Avatar field value:", updateData.avatar);

    // Define allowed fields for user updates
    // Note: email cannot be updated directly - use requestEmailChange instead
    const allowedFields = ["name", "username", "country", "role"];

    // Prepare form data for file upload
    const formData = new FormData();

    // Add only allowed regular fields with validation
    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined && updateData[field] !== null) {
        const value = updateData[field].toString().trim();
        if (value) {
          // Only add non-empty values
          console.log(`Adding field: ${field} = ${value}`);
          formData.append(field, value);
        }
      }
    });

    // Handle avatar/photo file upload separately
    if (updateData.avatarFile && updateData.avatarFile instanceof File) {
      console.log(
        "Adding new avatar file:",
        updateData.avatarFile.name,
        updateData.avatarFile.size,
      );
      // Use 'photo' field to match PocketBase schema
      formData.append("photo", updateData.avatarFile);
    }

    // Log FormData contents for debugging
    console.log("=== FormData Contents ===");
    for (let [key, value] of formData.entries()) {
      if (value instanceof File) {
        console.log(`${key}: [FILE] ${value.name} (${value.size} bytes)`);
      } else {
        console.log(`${key}: ${value}`);
      }
    }

    // Validate that we have at least one field to update
    let hasFields = false;
    for (let [key, value] of formData.entries()) {
      hasFields = true;
      break;
    }

    if (!hasFields) {
      console.warn("No valid fields to update");
      return { success: false, error: "No valid fields provided for update" };
    }

    // Update the user record
    const updatedUser = await pb.collection("users").update(userId, formData);

    console.log("User profile updated successfully:", updatedUser);
    return { success: true, data: updatedUser };
  } catch (error) {
    console.error("Profile update failed:", error);
    console.error("Error details:", {
      status: error.status,
      data: error.data,
      message: error.message,
    });

    let errorMessage = error.message;

    if (error.status === 400) {
      errorMessage = "Invalid data provided";
      // Extract specific validation errors if available
      if (error.data && error.data.data) {
        const validationErrors = Object.entries(error.data.data)
          .map(([field, errors]) => {
            const errorMsg =
              errors.message ||
              (Array.isArray(errors) ? errors.join(", ") : errors);
            return `${field}: ${errorMsg}`;
          })
          .join("; ");
        errorMessage += ` - ${validationErrors}`;
      }
    } else if (error.status === 403) {
      errorMessage = "Not authorized to update this profile";
    } else if (error.status === 404) {
      errorMessage = "User not found";
    } else if (error.status === 500) {
      errorMessage = "Server error. Please try again later.";
    }

    return { success: false, error: errorMessage };
  }
};

// Removed: email verification testing utility

// Function to request email change (requires verification)
export const requestEmailChange = async (newEmail) => {
  try {
    console.log("Requesting email change to:", newEmail);
    console.log("Auth state check:", {
      isValid: pb.authStore.isValid,
      token: pb.authStore.token ? "present" : "missing",
      model: pb.authStore.model ? pb.authStore.model.id : "null"
    });

    // Check if user is authenticated
    if (!pb.authStore.isValid || !pb.authStore.model) {
      return {
        success: false,
        error: "You must be logged in to change your email. Please log in and try again.",
      };
    }

    // Validate email format
    if (!newEmail || !newEmail.includes('@')) {
      return {
        success: false,
        error: "Please provide a valid email address",
      };
    }

    // Request email change using PocketBase
    const result = await pb.collection("users").requestEmailChange(newEmail);

    console.log("Email change request sent successfully:", result);
    return {
      success: true,
      message: "Email change verification link has been sent to your new email address. Please check your inbox.",
    };
  } catch (error) {
    console.error("Email change request failed:", error);
    console.error("Error details:", {
      status: error.status,
      data: error.data,
      message: error.message,
    });

    let errorMessage = error.message;

    if (error.status === 401) {
      errorMessage = "Authentication failed. Please log out and log back in, then try again.";
    } else if (error.status === 400) {
      errorMessage = "Invalid email address or email already in use";
      // Extract specific validation errors if available
      if (error.data && error.data.data) {
        const validationErrors = Object.entries(error.data.data)
          .map(([field, errors]) => {
            const errorMsg =
              errors.message ||
              (Array.isArray(errors) ? errors.join(", ") : errors);
            return `${field}: ${errorMsg}`;
          })
          .join("; ");
        errorMessage += ` - ${validationErrors}`;
      }
    } else if (error.status === 403) {
      errorMessage = "Not authorized to change email";
    } else if (error.status === 404) {
      errorMessage = "User not found";
    } else if (error.status === 500) {
      errorMessage = "Server error. Please try again later.";
    }

    return { success: false, error: errorMessage };
  }
};

// Function to update user password
export const updatePassword = async (userId, oldPassword, newPassword) => {
  try {
    console.log("Updating password for user:", userId);

    // Validate inputs
    if (!oldPassword || !newPassword) {
      return {
        success: false,
        error: "Both old and new passwords are required",
      };
    }

    if (oldPassword === newPassword) {
      return {
        success: false,
        error: "New password must be different from old password",
      };
    }

    // Update password using PocketBase
    const result = await pb.collection("users").update(userId, {
      oldPassword: oldPassword,
      password: newPassword,
      passwordConfirm: newPassword,
    });

    console.log("Password updated successfully:", result);
    return { success: true, data: result };
  } catch (error) {
    console.error("Password update failed:", error);
    console.error("Error details:", {
      status: error.status,
      data: error.data,
      message: error.message,
    });

    let errorMessage = error.message;

    if (error.status === 400) {
      errorMessage = "Invalid password data";
      // Extract specific validation errors if available
      if (error.data && error.data.data) {
        const validationErrors = Object.entries(error.data.data)
          .map(([field, errors]) => {
            const errorMsg =
              errors.message ||
              (Array.isArray(errors) ? errors.join(", ") : errors);
            return `${field}: ${errorMsg}`;
          })
          .join("; ");
        errorMessage += ` - ${validationErrors}`;
      }
    } else if (error.status === 403) {
      errorMessage = "Current password is incorrect";
    } else if (error.status === 404) {
      errorMessage = "User not found";
    } else if (error.status === 500) {
      errorMessage = "Server error. Please try again later.";
    }

    return { success: false, error: errorMessage };
  }
};

// Export the PocketBase instance for direct use if needed
export default pb;
