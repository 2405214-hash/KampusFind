
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://bsrqbxdvueockqdxsclj.supabase.co";
const supabaseKey = "sb_publishable_R2fXXTOAFifZsGOYhczbIw_K57w9170";

const supabase = createClient(supabaseUrl, supabaseKey);

const resetForm = document.getElementById("resetPasswordForm");
const message = document.getElementById("resetMessage");

resetForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
    message.textContent = "Passwords do not match!";
    message.style.color = "#ff7777";
    return;
}

    const { error } = await supabase.auth.updateUser({
        password: newPassword
    });

    if (error) {
    message.textContent = error.message;
    message.style.color = "#ff7777";
} else {
    message.textContent = "Password updated successfully! You can now log in.";
    message.style.color = "#7ee6a1";
    resetForm.reset();
}
});
// Toggle Password Visibility
const togglePasswordButtons = document.querySelectorAll(".toggle-password");

togglePasswordButtons.forEach(button => {
    button.addEventListener("click", function() {
        const targetId = this.dataset.target;
        const passwordInput = document.getElementById(targetId);

        if (passwordInput.type === "password") {
            passwordInput.type = "text";
            this.textContent = "🙈";
        } else {
            passwordInput.type = "password";
            this.textContent = "👁️";
        }
    });
});