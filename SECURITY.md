# Secure Design & Threat Modeling

This document outlines the security considerations, potential threats, and mitigation strategies implemented during the development of the Lost & Found application. Security was a core focus from the initial design phase to ensure that user data and the integrity of the platform are protected.

## 1. Assets to Protect
Identifying our core assets to ensure appropriate security measures are prioritized:
* **User Authentication State:** Session tokens or simulated login states that identify a user's role (Admin vs. Regular User).
* **Private User Information & Messages:** Personal details and private conversations between users regarding lost or found items.
* **Administrative Controls:** The admin dashboard, which allows for dispute resolution, item moderation, and system-wide visibility.
* **Item Data Integrity:** Ensuring that the status and details of lost/found items cannot be maliciously altered by unauthorized individuals.

## 2. Possible Attackers
Understanding who might attempt to compromise the system:
* **Unauthorized Users / Opportunists:** Individuals attempting to gain access to the admin dashboard to manipulate item statuses or view private information.
* **Malicious Users (Insiders):** Authenticated users trying to claim items that do not belong to them, or attempting to view/interfere with conversations they are not a part of.
* **Automated Scripts (Bots):** Scripts trying to spam the platform with fake items, messages, or attempting basic injection attacks.

## 3. Possible Threats
Based on the assets and potential attackers, the following threats were identified:
* **Cross-Site Scripting (XSS):** Attackers injecting malicious JavaScript into item descriptions or chat messages. If rendered unescaped, this could steal session data from other users or admins viewing the content.
* **Broken Access Control (Unauthorized Access):** Regular users forcing URL navigation to `/admin` routes to access administrative privileges, or attempting to modify/delete items they did not create.
* **Insecure Direct Object References (IDOR):** Users manipulating URL parameters (e.g., changing `/messages/1` to `/messages/2`) to view private conversations or items they shouldn't have access to.

## 4. Mitigation Strategies & Implementation
The following strategies were employed to mitigate the identified threats:

* **XSS Protection:** 
  * Leveraged Vue.js's default behavior, which automatically escapes HTML content within `{{ }}` interpolations. This ensures that any user-submitted data (chat messages, item titles/descriptions) is treated as raw text, neutering potential script injections.
* **Enforcing Access Control:**
  * Implemented strict Vue Router navigation guards (`beforeEach`). The router intercepts route changes to restricted areas (like `/admin` paths) and verifies the user's role in the Pinia state store before allowing navigation. If unauthorized, they are safely redirected.
  * Conditional rendering (`v-if`) is used extensively so that administrative UI elements are never even rendered in the DOM for regular users.
* **State & Data Validation:**
  * While relying on client-side state (Pinia) for simulation, actions that mutate state validate the user's permissions first. For instance, only admins have the UI controls to globally resolve conflicts or moderate chats.

## 5. Security During Development
Security was considered organically throughout the development cycle. Rather than bolting it on at the end, security principles influenced technical choices:
* **Principle of Least Privilege:** Users are only given access to the specific views and actions required for their role. The default state assumes lower privileges.
* **Component Isolation:** Using Vue's component architecture helped isolate state and behaviors, making it harder for vulnerabilities in one area (like public items) to bleed into sensitive areas (like admin messaging).
* **Safe Framework Features:** Choosing Vue 3 and the Composition API naturally guided the pattern toward safer data binding practices, reducing the surface area for common web vulnerabilities.