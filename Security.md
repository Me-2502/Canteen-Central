# Spring Boot Security — Complete Reference Notes

> A practical reference for understanding, implementing, debugging, and designing secure Spring Boot applications with Spring Security.

**Current reference:** Spring Security 7.x / Spring Boot 4.x
**Important:** APIs and defaults can differ between Spring Security 6 and 7. Always check the version used by your project before copying configuration.

---

# 1. What is Spring Security?

Spring Security is the security framework used by Spring applications to handle:

* Authentication
* Authorization
* Password storage
* Login/logout
* Session management
* CSRF protection
* Security headers
* OAuth 2.0
* OpenID Connect
* JWT / Bearer-token authentication
* Resource servers
* OAuth2 clients
* Method-level authorization
* Remember-me authentication
* LDAP authentication
* Security testing
* Protection against common web attacks

Spring Security is fundamentally concerned with answering two different questions:

```text
Authentication:
"Who are you?"

Authorization:
"What are you allowed to do?"
```

For example:

```text
User logs in
     |
     v
Authentication
     |
     v
Spring Security knows:
username = john
roles = USER, ADMIN
     |
     v
Authorization
     |
     +---- GET /products       -> allowed
     |
     +---- POST /products      -> allowed
     |
     +---- DELETE /users/123   -> denied
```

Spring Security provides both authentication and authorization infrastructure, but it does **not** automatically solve every security problem in an application. Application-level security, secure coding, dependency management, secrets management, infrastructure security, database security, logging, etc. still need to be addressed separately.

---

# 2. The Most Important Security Terms

Before learning Spring Security, understand these terms.

## 2.1 Authentication

Authentication verifies the identity of a user/client.

Examples:

```text
Username + Password
JWT
OAuth2 login
OIDC login
API Key
LDAP
Certificate
HTTP Basic
```

Example:

```text
POST /login

username = john
password = secret123
```

The application verifies the credentials.

If valid:

```text
Authenticated user = john
```

---

# 2.2 Authorization

Authorization determines what an authenticated user can do.

For example:

```text
john -> ROLE_USER
alice -> ROLE_ADMIN
```

Then:

```text
GET /products
```

may be available to both.

But:

```text
DELETE /users/10
```

may require:

```text
ROLE_ADMIN
```

Authentication happens before authorization.

```text
Request
  |
  v
Authentication
  |
  |-- invalid --> 401
  |
  v
Authenticated user
  |
  v
Authorization
  |
  |-- insufficient permissions --> 403
  |
  v
Controller
```

---

# 2.3 Principal

A `Principal` represents the currently authenticated identity.

In Spring Security, the authenticated principal is commonly represented through:

```java
Authentication
```

For example:

```java
Authentication authentication
```

You can obtain information such as:

```java
authentication.getName();
authentication.getAuthorities();
authentication.getPrincipal();
```

---

# 2.4 Authority

An authority represents a permission/granted capability.

Example:

```text
READ_PRODUCTS
WRITE_PRODUCTS
DELETE_PRODUCTS
```

Authorities are usually represented as strings.

---

# 2.5 Role

A role is a common abstraction for grouping authorities.

Examples:

```text
ROLE_USER
ROLE_ADMIN
ROLE_MANAGER
```

Spring Security traditionally treats role names specially.

For example:

```java
hasRole("ADMIN")
```

normally corresponds to:

```text
ROLE_ADMIN
```

Whereas:

```java
hasAuthority("ADMIN")
```

checks exactly:

```text
ADMIN
```

This distinction is important.

---

# 3. 401 vs 403

One of the most important things to remember:

## 401 Unauthorized

Usually means:

```text
The request has not been successfully authenticated.
```

Example:

```text
No JWT
Invalid JWT
Expired JWT
Invalid username/password
```

Conceptually:

```text
"I don't know who you are."
```

---

## 403 Forbidden

Usually means:

```text
You are authenticated, but you are not allowed to perform this operation.
```

Example:

```text
User has ROLE_USER

Endpoint requires ROLE_ADMIN
```

Conceptually:

```text
"I know who you are, but you are not allowed to do this."
```

---

# 4. Spring Boot Security Dependency

For a typical Spring Boot application:

## Maven

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

## Gradle

```gradle
implementation "org.springframework.boot:spring-boot-starter-security"
```

Spring Boot manages compatible dependency versions through its dependency-management/BOM system, so you normally should **not manually specify Spring Security versions** when using the Boot starter.

---

# 5. What Happens When You Add Spring Security?

This is one of the first things beginners notice.

Suppose you have:

```java
@RestController
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "Hello";
    }
}
```

You add:

```xml
spring-boot-starter-security
```

and start the application.

By default, Spring Boot/Spring Security secures web endpoints.

A default user may be created, and a generated password can be printed at startup.

The default behavior includes authentication, form login, HTTP Basic support, CSRF protection, security headers, session-fixation protection, and other protections.

This is why an endpoint that previously returned:

```text
Hello
```

may now return:

```text
401 Unauthorized
```

or redirect to a login page.

---

# 6. Basic Spring Security Configuration

Modern Spring Security applications should generally configure a `SecurityFilterChain` bean rather than using the old `WebSecurityConfigurerAdapter` approach.

Basic example:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/public/**").permitAll()
                .requestMatchers("/admin/**").hasRole("ADMIN")
                .anyRequest().authenticated()
            )
            .formLogin(Customizer.withDefaults())
            .logout(Customizer.withDefaults());

        return http.build();
    }
}
```

The important concept is:

```text
SecurityFilterChain
        |
        +-- authentication configuration
        +-- authorization rules
        +-- CSRF
        +-- session management
        +-- headers
        +-- exception handling
        +-- login/logout
        +-- etc.
```

---

# 7. `SecurityFilterChain`

`SecurityFilterChain` is one of the most important concepts in Spring Security.

Incoming HTTP requests pass through a chain of security filters before reaching your controller.

Conceptually:

```text
HTTP Request
     |
     v
Spring Security Filters
     |
     v
Authentication
     |
     v
Authorization
     |
     v
Controller
```

Different filters perform different responsibilities.

Examples include filters involved in:

* Security context handling
* CSRF
* authentication
* bearer token processing
* username/password authentication
* authorization
* exception handling
* request headers
* session management

You normally do **not** need to manually instantiate these filters.

Spring Security constructs the filter chain based on your configuration.

---

# 8. Request Authorization

A common configuration:

```java
@Bean
SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

    http.authorizeHttpRequests(auth -> auth
        .requestMatchers("/public/**").permitAll()
        .requestMatchers("/admin/**").hasRole("ADMIN")
        .requestMatchers("/user/**").hasAnyRole("USER", "ADMIN")
        .anyRequest().authenticated()
    );

    return http.build();
}
```

Meaning:

```text
/public/**       -> anyone
/admin/**        -> ADMIN
/user/**         -> USER or ADMIN
everything else -> authenticated
```

---

# 9. `permitAll()`

```java
.requestMatchers("/public/**").permitAll()
```

Means the endpoint can be accessed without authentication.

Typical public endpoints:

```text
/
 /health
 /login
 /register
 /docs
 /swagger-ui/**
```

Be careful when making endpoints public.

For example:

```java
.requestMatchers("/users/**").permitAll()
```

may accidentally expose sensitive user data.

Always ask:

```text
Does this endpoint really need to be public?
```

---

# 10. `authenticated()`

```java
.anyRequest().authenticated()
```

Means:

```text
The user must be authenticated.
```

This is generally a good secure default.

Prefer:

```java
.anyRequest().authenticated()
```

over:

```java
.anyRequest().permitAll()
```

and then attempting to remember which endpoints need protection.

A secure default is:

```text
Deny by default.
Explicitly allow what should be public.
```

---

# 11. `hasRole()`

Example:

```java
.requestMatchers("/admin/**").hasRole("ADMIN")
```

This generally checks for:

```text
ROLE_ADMIN
```

So if your user has:

```text
ROLE_ADMIN
```

then:

```java
hasRole("ADMIN")
```

matches.

---

# 12. `hasAuthority()`

Example:

```java
.requestMatchers("/reports/**")
    .hasAuthority("REPORT_READ")
```

This checks the exact authority:

```text
REPORT_READ
```

Unlike roles, arbitrary permission names can be used.

Example:

```text
USER_READ
USER_WRITE
USER_DELETE
REPORT_READ
REPORT_EXPORT
```

---

# 13. Role vs Authority

A useful mental model:

```text
Role:
    ROLE_ADMIN

Authority:
    USER_DELETE
```

A role is commonly a coarse-grained grouping.

Authorities are useful for fine-grained permissions.

For a small application:

```text
ROLE_USER
ROLE_ADMIN
```

may be sufficient.

For a larger application:

```text
USER_READ
USER_CREATE
USER_UPDATE
USER_DELETE
ORDER_READ
ORDER_CANCEL
REPORT_EXPORT
```

may be more appropriate.

---

# 14. Authentication Architecture

A simplified Spring Security authentication flow:

```text
HTTP Request
     |
     v
Authentication Filter
     |
     v
Authentication Token
     |
     v
AuthenticationManager
     |
     v
AuthenticationProvider
     |
     v
UserDetailsService / LDAP / JWT / etc.
     |
     v
Authentication successful
     |
     v
SecurityContext
```

The exact flow depends on the authentication mechanism.

---

# 15. `Authentication`

`Authentication` represents the result/current state of authentication.

Conceptually:

```java
Authentication authentication;
```

It can contain:

```text
Principal
Credentials
Authorities
Authenticated status
```

For example:

```java
authentication.getName();
authentication.getAuthorities();
authentication.getPrincipal();
```

---

# 16. `SecurityContext`

Spring Security stores the current authenticated identity in a `SecurityContext`.

Conceptually:

```text
SecurityContext
       |
       +-- Authentication
               |
               +-- Principal
               +-- Authorities
```

You can access it:

```java
SecurityContext context =
    SecurityContextHolder.getContext();

Authentication authentication =
    context.getAuthentication();
```

Then:

```java
String username = authentication.getName();
```

---

# 17. `SecurityContextHolder`

`SecurityContextHolder` is the common entry point for obtaining the current security context.

Example:

```java
Authentication authentication =
    SecurityContextHolder
        .getContext()
        .getAuthentication();
```

You can use this when the current authenticated user is needed somewhere where method parameters are inconvenient.

However, avoid scattering calls to `SecurityContextHolder` throughout business logic.

Prefer explicit method parameters or dedicated abstractions where practical.

---

# 18. Getting the Current User in a Controller

You can use:

```java
@GetMapping("/me")
public String me(Authentication authentication) {
    return authentication.getName();
}
```

Or:

```java
@GetMapping("/me")
public String me(@AuthenticationPrincipal UserDetails user) {
    return user.getUsername();
}
```

This is usually cleaner than manually retrieving the `SecurityContext`.

---

# 19. `UserDetails`

`UserDetails` represents user information used by Spring Security.

Typical implementation:

```java
public class CustomUserDetails implements UserDetails {

    private final String username;
    private final String password;
    private final Collection<? extends GrantedAuthority> authorities;

    // implementation...
}
```

It commonly contains:

```text
username
password
authorities
account status
```

---

# 20. `UserDetailsService`

`UserDetailsService` loads a user by username.

Example:

```java
@Service
public class CustomUserDetailsService
        implements UserDetailsService {

    @Override
    public UserDetails loadUserByUsername(String username)
            throws UsernameNotFoundException {

        // load user from database

        return User
            .withUsername(username)
            .password(password)
            .roles("USER")
            .build();
    }
}
```

Conceptually:

```text
username
   |
   v
UserDetailsService
   |
   v
Database
   |
   v
UserDetails
```

---

# 21. Database-backed Authentication

A common production setup:

```text
Client
  |
  v
Login request
  |
  v
AuthenticationManager
  |
  v
UserDetailsService
  |
  v
UserRepository
  |
  v
Database
```

Example entity:

```java
@Entity
public class User {

    @Id
    @GeneratedValue
    private Long id;

    private String username;

    private String password;

    private boolean enabled;
}
```

Do not store plain-text passwords.

---

# 22. Password Storage

Never do this:

```text
password = "mypassword123"
```

in the database.

Do not use reversible encryption merely to hide passwords.

Passwords should generally be stored using a password hashing algorithm.

Spring Security provides password encoders for this purpose.

Example:

```java
@Bean
PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

Then:

```java
String hash = passwordEncoder.encode(rawPassword);
```

During authentication:

```java
passwordEncoder.matches(
    rawPassword,
    storedHash
);
```

---

# 23. Password Hashing vs Encryption

This distinction is critical.

## Encryption

```text
plaintext -> encryption -> ciphertext
ciphertext -> decryption -> plaintext
```

Encryption is reversible with a key.

Use encryption when you need to recover the original value.

---

## Password hashing

```text
password -> hash
```

You should not need to recover the original password.

During login:

```text
provided password
       |
       v
password verification
       |
       v
stored password hash
```

Password storage should use an appropriate password hashing function rather than ordinary encryption.

---

# 24. BCrypt

Example:

```java
@Bean
PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```

BCrypt intentionally makes password hashing computationally expensive.

This makes large-scale password guessing more difficult.

Spring Security also supports other password encoding strategies, and the appropriate algorithm should be selected according to current security requirements.

---

# 25. Never Log Passwords

Never do:

```java
log.info("Password: {}", password);
```

Do not log:

```text
Passwords
JWTs
Refresh tokens
Session IDs
API keys
Client secrets
Authorization headers
Sensitive personal information
```

Logging is often retained for a long time and may be accessible to many systems/users.

---

# 26. `DelegatingPasswordEncoder`

Spring Security supports a delegating password encoder approach.

A stored password may look conceptually like:

```text
{bcrypt}$2a$...
```

The prefix tells Spring which encoding mechanism was used.

This is useful when migrating password hashing algorithms.

For example:

```text
Old users:
bcrypt

New users:
stronger/new algorithm
```

You can gradually upgrade hashes instead of forcing every user to reset their password immediately.

---

# 27. AuthenticationManager

`AuthenticationManager` is responsible for processing authentication requests.

Conceptually:

```java
Authentication authenticate(
    Authentication authentication
);
```

It delegates authentication to one or more authentication providers.

---

# 28. AuthenticationProvider

An `AuthenticationProvider` knows how to authenticate a particular type of authentication.

Examples:

```text
Username/password
LDAP
JWT
custom authentication
```

Conceptually:

```text
AuthenticationManager
        |
        +---- AuthenticationProvider A
        |
        +---- AuthenticationProvider B
        |
        +---- AuthenticationProvider C
```

---

# 29. Authentication Flow — Username/Password

A simplified flow:

```text
POST /login
username=john
password=secret
        |
        v
Authentication Filter
        |
        v
UsernamePasswordAuthenticationToken
        |
        v
AuthenticationManager
        |
        v
AuthenticationProvider
        |
        v
UserDetailsService
        |
        v
Database
        |
        v
PasswordEncoder.matches()
        |
        +---- false -> authentication failure
        |
        +---- true
                |
                v
        Authentication created
                |
                v
        SecurityContext
```

---

# 30. Form Login

For traditional browser applications:

```java
http
    .formLogin(Customizer.withDefaults());
```

This provides form-based authentication.

A custom login page can be configured:

```java
http
    .formLogin(form -> form
        .loginPage("/login")
        .permitAll()
    );
```

You then provide your own:

```text
GET /login
```

page.

---

# 31. HTTP Basic Authentication

Example:

```java
http
    .httpBasic(Customizer.withDefaults());
```

The client sends credentials using the HTTP `Authorization` header.

Conceptually:

```text
Authorization: Basic <encoded-credentials>
```

HTTP Basic should only be used over HTTPS.

It is commonly useful for:

* Internal APIs
* Simple service-to-service communication
* Development
* Certain legacy integrations

For modern distributed APIs, OAuth2/JWT-based approaches are often more appropriate.

---

# 32. Logout

Example:

```java
http
    .logout(logout -> logout
        .logoutUrl("/logout")
    );
```

For session-based applications, logout should invalidate the user's session/security state.

Important considerations:

```text
Invalidate session
Clear authentication
Clear security-related cookies where appropriate
Handle CSRF correctly
Invalidate server-side state when applicable
```

For token-based authentication, logout semantics are different because a stateless JWT cannot simply be "deleted" from the server after issuance.

---

# 33. Session-Based Authentication

Traditional web applications often use:

```text
Browser
   |
   | username/password
   v
Server
   |
   | creates authenticated session
   v
Session ID cookie
```

Subsequent requests:

```text
Browser
   |
   | session cookie
   v
Server
   |
   v
Session
   |
   v
Authenticated user
```

---

# 34. Session Management

Example:

```java
http
    .sessionManagement(session -> session
        .sessionCreationPolicy(
            SessionCreationPolicy.IF_REQUIRED
        )
    );
```

Common policies include:

```text
ALWAYS
IF_REQUIRED
NEVER
STATELESS
```

For a JWT resource server, you will commonly use:

```java
SessionCreationPolicy.STATELESS
```

because authentication is derived from the token rather than a server-side login session.

---

# 35. Session Fixation

Session fixation is an attack where an attacker attempts to make a victim use a session identifier known to the attacker.

Modern Spring Security provides protection against session fixation as part of its security behavior.

Do not disable session-fixation protection without understanding the consequences.

---

# 36. CSRF

CSRF means:

```text
Cross-Site Request Forgery
```

The attacker attempts to make a victim's browser perform an unwanted authenticated action.

Example:

```text
Victim is logged into bank.com

Victim visits evil.com

evil.com causes browser to send:

POST bank.com/transfer
```

If the browser automatically sends the authentication cookie, the server may mistakenly think the request came intentionally from the user.

---

# 37. Why Cookies Make CSRF Relevant

Suppose:

```text
Cookie:
SESSION=abc123
```

The browser automatically sends the cookie to the relevant domain.

Therefore:

```text
Browser
   |
   +-- legitimate request -> bank.com
   |
   +-- malicious request  -> bank.com
```

Both may contain the authentication cookie.

CSRF protection helps distinguish legitimate application requests from forged ones.

---

# 38. CSRF Token

A common CSRF defense is a token.

Conceptually:

```text
Server generates token
       |
       v
Client includes token in state-changing request
       |
       v
Server validates token
```

An attacker generally cannot read the legitimate application's CSRF token because of browser security restrictions.

---

# 39. Should CSRF Be Disabled?

Do not blindly disable CSRF.

This is dangerous:

```java
http
    .csrf(csrf -> csrf.disable());
```

You need to understand the authentication mechanism and application architecture first.

For a traditional browser application using cookies/session authentication, CSRF protection is generally important.

For a stateless API using an `Authorization: Bearer ...` token and not relying on browser-managed authentication cookies, CSRF considerations are different.

The correct decision depends on the architecture.

---

# 40. Common JWT API Configuration

A typical stateless REST API may look conceptually like:

```java
@Bean
SecurityFilterChain securityFilterChain(HttpSecurity http)
        throws Exception {

    http
        .csrf(csrf -> csrf.disable())
        .sessionManagement(session -> session
            .sessionCreationPolicy(
                SessionCreationPolicy.STATELESS
            )
        )
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/public/**").permitAll()
            .anyRequest().authenticated()
        )
        .oauth2ResourceServer(oauth2 -> oauth2
            .jwt(Customizer.withDefaults())
        );

    return http.build();
}
```

However, do **not** interpret this as:

```text
JWT = always disable CSRF
```

The correct approach depends on how the token is transported and whether browsers automatically attach credentials.

---

# 41. CORS

CORS means:

```text
Cross-Origin Resource Sharing
```

Suppose your frontend is:

```text
https://frontend.example.com
```

and backend:

```text
https://api.example.com
```

These are different origins.

The browser applies same-origin restrictions.

CORS allows the server to explicitly declare which cross-origin requests are permitted.

---

# 42. CORS vs CSRF

These are different problems.

```text
CORS
----
Controls which browser origins may access resources.

CSRF
----
Protects authenticated state-changing requests from forged requests.
```

Do not think:

```text
"CORS is enabled, therefore CSRF is handled."
```

That is incorrect.

---

# 43. CORS Configuration

Example:

```java
@Bean
CorsConfigurationSource corsConfigurationSource() {

    CorsConfiguration configuration =
        new CorsConfiguration();

    configuration.setAllowedOrigins(
        List.of("https://frontend.example.com")
    );

    configuration.setAllowedMethods(
        List.of("GET", "POST", "PUT", "DELETE")
    );

    configuration.setAllowedHeaders(
        List.of("Authorization", "Content-Type")
    );

    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source =
        new UrlBasedCorsConfigurationSource();

    source.registerCorsConfiguration(
        "/**",
        configuration
    );

    return source;
}
```

Then:

```java
http.cors(Customizer.withDefaults());
```

Do not use:

```text
Access-Control-Allow-Origin: *
```

together with credentialed browser requests.

More importantly, avoid allowing every origin in production unless the architecture genuinely requires it.

---

# 44. Security Headers

Spring Security can provide security-related HTTP headers.

Examples include headers helping with:

```text
Clickjacking
MIME sniffing
Caching
HSTS
```

Typical headers include:

```text
Strict-Transport-Security
X-Content-Type-Options
Cache-Control
X-Frame-Options
```

The exact recommended header set should be reviewed against your application's requirements.

---

# 45. HTTPS

Authentication should generally happen over HTTPS.

Without HTTPS:

```text
Client
   |
   | password / token
   |
   v
Network
```

Sensitive information may be intercepted.

With HTTPS:

```text
Client
   |
   | encrypted TLS connection
   v
Server
```

HTTPS protects data in transit.

---

# 46. HSTS

HTTP Strict Transport Security tells browsers that a site should be accessed using HTTPS.

Conceptually:

```text
Strict-Transport-Security:
    max-age=...
```

This helps protect against downgrade attacks and accidental HTTP access.

Only enable HSTS when your deployment is correctly configured for HTTPS.

---

# 47. JWT

JWT means:

```text
JSON Web Token
```

A JWT typically consists of:

```text
header.payload.signature
```

Example conceptually:

```text
xxxxx.yyyyy.zzzzz
```

---

# 48. JWT Structure

Header:

```json
{
  "alg": "RS256",
  "typ": "JWT"
}
```

Payload:

```json
{
  "sub": "123",
  "iss": "https://issuer.example.com",
  "aud": "my-api",
  "exp": 1760000000,
  "scope": "read write"
}
```

Signature:

```text
signature(
    base64url(header)
    + "."
    + base64url(payload)
)
```

Important:

> JWT payloads are normally encoded, not encrypted.

Therefore, do not put secrets into ordinary JWT claims.

---

# 49. JWT Claims

Common claims include:

```text
iss -> issuer
sub -> subject
aud -> audience
exp -> expiration
iat -> issued-at time
nbf -> not-before time
jti -> token identifier
```

Application-specific claims may also exist.

---

# 50. JWT Authentication Flow

A typical architecture:

```text
                    +-------------------+
                    | Authorization     |
                    | Server / IdP      |
                    +---------+---------+
                              |
                              | JWT
                              v
Client -----------------> Resource Server
                              |
                              v
                      Validate JWT
                              |
                              v
                      SecurityContext
                              |
                              v
                         Controller
```

For example:

```text
Client
  |
  | Authorization: Bearer <JWT>
  v
Spring Boot API
  |
  +--> validate signature
  +--> validate issuer
  +--> validate expiration
  +--> validate audience where appropriate
  +--> extract authorities
  |
  v
Authenticated request
```

---

# 51. OAuth2 Resource Server

If your Spring Boot application exposes an API protected by bearer tokens, it can act as an OAuth2 Resource Server.

Typical dependency:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
</dependency>
```

JWT support additionally involves the appropriate JOSE/JWT infrastructure.

---

# 52. Resource Server Configuration

A typical Boot configuration uses an issuer:

```yaml
spring:
  security:
    oauth2:
      resourceserver:
        jwt:
          issuer-uri: https://idp.example.com/issuer
```

Spring Security can use the issuer to discover the authorization server metadata and public keys and validate JWTs.

The exact issuer URL depends on your identity provider.

---

# 53. Resource Server vs Authorization Server

These are different components.

## Authorization Server

Issues tokens.

```text
Client
  |
  v
Authorization Server
  |
  v
Access Token
```

## Resource Server

Protects APIs and validates access tokens.

```text
Client
  |
  | Bearer token
  v
Resource Server
  |
  v
API
```

A system can contain both, but they have different responsibilities.

---

# 54. OAuth2

OAuth2 is primarily an authorization framework.

It allows a client to obtain authorization to access protected resources.

Typical actors:

```text
Resource Owner
Client
Authorization Server
Resource Server
```

Example:

```text
User
 |
 v
Frontend
 |
 v
Authorization Server
 |
 v
Access Token
 |
 v
API
```

---

# 55. OpenID Connect

OIDC builds an identity layer on top of OAuth2.

OAuth2:

```text
Authorization
```

OIDC:

```text
Authentication + identity information
```

If your requirement is:

```text
"Login with Google"
"Login with Microsoft"
"Login with an enterprise identity provider"
```

you will commonly encounter OIDC.

---

# 56. Authorization Code Flow

A common browser-based OAuth2/OIDC flow:

```text
User
 |
 v
Client Application
 |
 | authorization request
 v
Authorization Server
 |
 | authenticate user
 | ask for consent
 v
Authorization Code
 |
 v
Client
 |
 | exchange code
 v
Authorization Server
 |
 v
Access Token
```

With modern applications, use the appropriate OAuth2 flow for the client type and threat model.

Avoid designing authentication around obsolete flows simply because an old tutorial demonstrates them.

---

# 57. PKCE

PKCE means:

```text
Proof Key for Code Exchange
```

It helps protect authorization-code flows, particularly public clients.

Conceptually:

```text
Client generates:
code_verifier

Client derives:
code_challenge

Authorization request:
code_challenge

Token request:
code_verifier

Authorization server verifies:
challenge == derived(verifier)
```

Use modern OAuth2/OIDC guidance when implementing authorization flows.

---

# 58. Access Token vs Refresh Token

## Access Token

Shorter-lived credential used to access APIs.

Example:

```text
Authorization: Bearer <access-token>
```

## Refresh Token

Used to obtain a new access token without requiring the user to authenticate again.

Generally:

```text
Access token:
short lifetime

Refresh token:
longer lifetime
```

Refresh tokens require particularly careful storage and lifecycle management.

---

# 59. JWT Expiration

JWTs should normally have an expiration.

Example:

```json
{
  "exp": 1760000000
}
```

A resource server should reject expired tokens.

Do not make access tokens valid indefinitely.

---

# 60. JWT Validation

A secure resource server should validate more than just the token's existence.

Depending on the architecture, validation may include:

```text
Signature
Issuer
Expiration
Not-before
Audience
Token type
Scopes
Authorities
```

Do not simply decode a JWT and trust its payload.

Decoding:

```text
base64 decode
```

is not authentication.

Signature validation is essential.

---

# 61. JWT Signing Algorithms

Common asymmetric algorithms include:

```text
RS256
ES256
```

The appropriate algorithm depends on the identity-provider ecosystem and requirements.

For distributed systems, asymmetric signing can be useful because:

```text
Authorization Server:
private key -> signs

Resource Server:
public key -> verifies
```

The resource server does not need the signing private key.

---

# 62. Never Trust the JWT Header's `alg` Blindly

A resource server should be configured to accept appropriate algorithms rather than blindly trusting arbitrary algorithm declarations.

Do not build your own JWT verification code unless there is a very strong reason.

Use well-tested Spring Security/Jose infrastructure.

---

# 63. JWT Authorities and Scopes

JWTs often contain:

```text
scope
scp
roles
authorities
```

The application may map those claims into Spring Security authorities.

Example:

```text
scope = "orders.read orders.write"
```

could become:

```text
SCOPE_orders.read
SCOPE_orders.write
```

Then:

```java
.hasAuthority("SCOPE_orders.read")
```

can be used.

The exact mapping depends on your configuration and token format.

---

# 64. Method Security

URL-level authorization is not always enough.

Enable method-level security:

```java
@Configuration
@EnableMethodSecurity
public class SecurityConfig {
}
```

Then:

```java
@PreAuthorize("hasRole('ADMIN')")
public void deleteUser(Long id) {
    // ...
}
```

Method security can protect service-layer operations in addition to HTTP endpoints.

Spring Security's authorization model supports both request-level and method-level authorization.

---

# 65. `@PreAuthorize`

Example:

```java
@PreAuthorize("hasRole('ADMIN')")
public void deleteUser(Long id) {
}
```

Another example:

```java
@PreAuthorize("hasAuthority('USER_DELETE')")
public void deleteUser(Long id) {
}
```

You can also use expressions involving method arguments.

Example:

```java
@PreAuthorize("#userId == authentication.principal.id")
public User getUser(Long userId) {
    // ...
}
```

Be careful with complex SpEL expressions. Keep authorization rules understandable.

---

# 66. `@PostAuthorize`

`@PostAuthorize` evaluates authorization after the method executes.

Example:

```java
@PostAuthorize(
    "returnObject.owner == authentication.name"
)
public Document getDocument(Long id) {
    // ...
}
```

This can be useful for object-level authorization.

However, be careful about performing expensive or sensitive work before authorization is evaluated.

---

# 67. `@Secured`

You may encounter:

```java
@Secured("ROLE_ADMIN")
```

This is an older-style annotation-based approach.

Modern Spring Security applications often use:

```java
@PreAuthorize
```

because it provides more expressive authorization rules.

---

# 68. `@RolesAllowed`

You may also see:

```java
@RolesAllowed("ADMIN")
```

This is based on JSR-250-style security annotations.

Spring Security supports multiple method-security styles.

Choose one approach and use it consistently.

---

# 69. URL Security vs Method Security

Do not assume they are interchangeable.

A good architecture can use both:

```text
HTTP layer
    |
    | coarse-grained authorization
    v
Controller
    |
    v
Service layer
    |
    | business authorization
    v
Repository
```

Example:

```text
HTTP:
GET /admin/reports -> authenticated

Service:
generateReport() -> requires REPORT_EXPORT
```

This gives you defense in depth.

---

# 70. Object-Level Authorization / IDOR

A very common security bug is:

```text
GET /users/123
```

checking only:

```text
user is authenticated
```

but not checking:

```text
does this user have permission to view user 123?
```

For example:

```text
Alice:
GET /users/100 -> own resource

Alice:
GET /users/200 -> another user's resource
```

Authentication alone does not prevent this.

You need object-level authorization.

This is commonly known as an IDOR/BOLA-style vulnerability.

---

# 71. Never Trust IDs from the Client

Do not assume:

```text
/user/123
```

means the caller is allowed to access user `123`.

Always enforce authorization server-side.

Bad:

```java
@GetMapping("/users/{id}")
public User getUser(@PathVariable Long id) {
    return repository.findById(id).orElseThrow();
}
```

if ownership restrictions are required.

Better architecture:

```text
authenticated user
       |
       v
authorization check
       |
       v
requested resource
```

---

# 72. Principle of Least Privilege

Every user/service should have only the permissions necessary to perform its job.

Avoid:

```text
Everyone -> ADMIN
```

Avoid giving:

```text
READ + WRITE + DELETE
```

when only:

```text
READ
```

is needed.

Least privilege should apply to:

```text
Users
Services
Database accounts
Cloud identities
OAuth scopes
API clients
Containers
```

---

# 73. Default Deny

A strong authorization pattern:

```java
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/public/**").permitAll()
    .requestMatchers("/admin/**").hasRole("ADMIN")
    .anyRequest().authenticated()
)
```

The key idea:

```text
Explicitly define public endpoints.
Everything else requires authentication.
```

For sensitive applications, explicitly define authorization for sensitive operations rather than relying on accidental defaults.

---

# 74. Password Policy

A password policy should consider:

```text
Minimum length
Compromised-password detection
Rate limiting
Brute-force protection
MFA
Password reset security
Credential stuffing protection
```

Avoid excessively complicated rules such as:

```text
must contain uppercase
must contain lowercase
must contain 2 symbols
must contain 3 numbers
```

Length and resistance to breached-password guessing are often more useful than arbitrary complexity requirements.

---

# 75. Brute-Force Protection

Spring Security does not magically solve every brute-force problem.

Consider:

```text
Rate limiting
Account lockout policy
Progressive delays
IP/device monitoring
CAPTCHA where appropriate
MFA
Credential stuffing detection
```

Be careful with account lockout because it can itself be abused to deny service to legitimate users.

---

# 76. MFA

Multi-factor authentication adds another authentication factor.

Examples:

```text
Password
+
Authenticator app

Password
+
Hardware security key

Password
+
Passkey
```

Spring Security 7 includes MFA-related support, but the actual MFA architecture still depends on the identity/authentication system you are integrating with.

---

# 77. Password Reset

Password reset flows are security-sensitive.

A good reset flow generally looks like:

```text
User requests reset
       |
       v
Generate high-entropy random token
       |
       v
Send reset link
       |
       v
User opens link
       |
       v
Validate token
       |
       v
Set new password
       |
       v
Invalidate token
```

Important:

```text
Reset tokens should expire.
Reset tokens should be single-use.
Do not log reset tokens.
Do not expose whether an email exists.
Invalidate relevant sessions after password reset where appropriate.
```

---

# 78. Email Enumeration

Avoid responses such as:

```text
"User with email john@example.com does not exist."
```

Attackers can use this to discover registered accounts.

Prefer a generic response:

```text
"If an account exists, you will receive further instructions."
```

This principle applies to:

```text
Login
Password reset
Registration
Account recovery
```

---

# 79. Secrets Management

Never hard-code:

```java
String clientSecret = "super-secret";
```

or:

```yaml
password: my-production-password
```

into source control.

Use:

```text
Environment variables
Secret managers
Vault
Cloud secret-management services
Kubernetes Secrets
Deployment platform secret stores
```

Also avoid accidentally committing secrets into Git history.

---

# 80. Configuration Separation

Use environment-specific configuration.

For example:

```text
application.yml
application-dev.yml
application-test.yml
application-prod.yml
```

But remember:

> Profiles are configuration organization, not a security boundary.

Do not assume:

```text
application-prod.yml
```

automatically makes a secret secure.

The secret itself should be managed appropriately.

---

# 81. OAuth2 Client

Spring Security can also act as an OAuth2 client.

Typical scenario:

```text
Your application
      |
      v
Google / Microsoft / Okta / another IdP
      |
      v
Authenticated user
```

This is useful for:

```text
Login with Google
Enterprise SSO
OIDC login
Calling protected APIs
```

Spring Security supports OAuth2 authorization grants and client functionality.

---

# 82. Login vs Resource Server

These are commonly confused.

## OAuth2 Login

Your application wants to authenticate a user through an external identity provider.

```text
Browser
  |
  v
Your App
  |
  v
Identity Provider
  |
  v
User logged into Your App
```

## Resource Server

Your application is an API that receives bearer tokens.

```text
Client
  |
  | Bearer token
  v
Your API
```

One application can potentially play multiple roles, but understand the difference.

---

# 83. SSO

Single Sign-On means users authenticate through a centralized identity system.

Example:

```text
Employee
   |
   v
Corporate Identity Provider
   |
   +---- Application A
   |
   +---- Application B
   |
   +---- Application C
```

The applications trust the identity provider.

Common technologies:

```text
OIDC
OAuth2
SAML
```

---

# 84. LDAP / Active Directory

Spring Security can integrate with LDAP-based identity systems.

Typical enterprise architecture:

```text
Spring Boot
     |
     v
LDAP / Active Directory
     |
     v
Users + Groups
```

This is common in enterprise environments.

Do not implement LDAP authentication manually unless you have a specific reason.

Use the supported Spring Security integrations.

---

# 85. Custom Authentication

Sometimes a project has a custom authentication mechanism.

For example:

```text
Existing legacy authentication service
Custom token
Special hardware authentication
Internal identity service
```

You can implement custom authentication components.

However:

> Custom authentication code should be treated as security-critical code.

Avoid reinventing:

```text
Password hashing
JWT validation
Cryptography
Session management
OAuth2 protocols
```

Use established Spring Security and cryptographic libraries whenever possible.

---

# 86. Custom Authentication Filter

You may encounter tutorials implementing:

```java
OncePerRequestFilter
```

and manually parsing JWTs.

This can be appropriate for genuinely custom protocols, but for standard OAuth2/JWT resource-server authentication, prefer Spring Security's built-in resource server support.

Do not create a custom JWT filter simply because a tutorial from several years ago does it.

---

# 87. Why Avoid Unnecessary Custom JWT Filters?

A custom implementation can accidentally get details wrong:

```text
Signature validation
Issuer validation
Audience validation
Key rotation
Algorithm handling
Expiration
Error handling
Authorities
SecurityContext
```

Spring Security already provides mature infrastructure for standard bearer-token resource-server use cases.

---

# 88. Custom `UserDetails`

If your domain model is complex, you can create:

```java
public class CustomUserDetails
        implements UserDetails {
}
```

Example:

```java
public class CustomUserDetails implements UserDetails {

    private final User user;

    public CustomUserDetails(User user) {
        this.user = user;
    }

    public Long getId() {
        return user.getId();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public Collection<? extends GrantedAuthority>
            getAuthorities() {

        return user.getRoles()
            .stream()
            .map(role ->
                new SimpleGrantedAuthority(
                    "ROLE_" + role.getName()
                )
            )
            .toList();
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public boolean isEnabled() {
        return user.isEnabled();
    }

    // other UserDetails methods
}
```

Be careful not to expose sensitive domain data through your security principal.

---

# 89. Roles in a Database

Example database design:

```text
users
-----
id
username
password
enabled

roles
-----
id
name

user_roles
----------
user_id
role_id
```

Then:

```text
john
  |
  +-- USER

alice
  |
  +-- USER
  +-- ADMIN
```

For larger systems, permissions may be modeled separately.

---

# 90. Role-Based Access Control

RBAC:

```text
User
 |
 v
Role
 |
 v
Permissions
```

Example:

```text
Alice
  |
  v
ADMIN
  |
  +-- USER_READ
  +-- USER_CREATE
  +-- USER_UPDATE
  +-- USER_DELETE
```

This is easier to maintain than attaching hundreds of permissions directly to individual users.

---

# 91. Permission-Based Authorization

Instead of:

```java
hasRole("ADMIN")
```

you can use:

```java
hasAuthority("USER_DELETE")
```

This gives finer control.

Example:

```text
ADMIN
    USER_READ
    USER_CREATE
    USER_UPDATE
    USER_DELETE

SUPPORT
    USER_READ

REPORTING
    REPORT_READ
    REPORT_EXPORT
```

---

# 92. Multi-Tenant Applications

Security becomes more complicated in multi-tenant systems.

Example:

```text
Tenant A:
users 1,2,3

Tenant B:
users 4,5,6
```

A user from Tenant A must never be able to access:

```text
Tenant B resources
```

Simply checking:

```text
ROLE_USER
```

is not enough.

You need tenant-aware authorization.

Conceptually:

```text
authenticated user
      |
      +-- tenant = A
      |
      v
requested resource
      |
      +-- tenant = A -> allowed
      |
      +-- tenant = B -> denied
```

Tenant isolation must be enforced server-side, preferably at multiple layers where appropriate.

---

# 93. Database-Level Security

Application authorization is not always enough.

Consider defense in depth:

```text
API authorization
       +
Service authorization
       +
Database constraints / isolation
```

For highly sensitive systems, database access policies may provide another security boundary.

---

# 94. Mass Assignment

Suppose your API accepts:

```json
{
  "username": "john",
  "role": "ADMIN"
}
```

and blindly maps JSON to your entity.

An attacker might attempt:

```json
{
  "role": "ADMIN"
}
```

Do not expose sensitive domain fields for arbitrary client updates.

Prefer DTOs:

```java
public record UpdateUserRequest(
    String displayName
) {
}
```

rather than accepting your entire entity.

---

# 95. Input Validation

Spring Security does not replace input validation.

Use validation such as:

```java
@NotBlank
@Email
@Size
@Pattern
@Valid
```

Example:

```java
public record RegisterRequest(
    @NotBlank
    @Email
    String email,

    @NotBlank
    @Size(min = 12)
    String password
) {
}
```

Validation protects application logic and helps reduce malformed/malicious input.

---

# 96. SQL Injection

Do not construct SQL like:

```java
String sql =
    "SELECT * FROM users WHERE username = '" +
    username +
    "'";
```

Use:

```text
JPA parameters
Prepared statements
Spring Data repositories
```

Spring Security does not automatically prevent SQL injection.

---

# 97. XSS

XSS means:

```text
Cross-Site Scripting
```

Never assume:

```text
Spring Security = XSS solved
```

Use:

```text
Output encoding
Input validation where appropriate
Content Security Policy
Safe templating
Avoid unsafe HTML rendering
```

For APIs returning JSON, XSS risks still exist in frontend consumers.

---

# 98. Content Security Policy

CSP helps control what resources a browser is allowed to load/execute.

Conceptually:

```text
Content-Security-Policy:
    default-src 'self'
```

A proper CSP needs to be designed according to the application.

Do not blindly paste a restrictive CSP into production without testing your application's legitimate scripts/styles/resources.

---

# 99. Clickjacking

Clickjacking attempts to trick users into interacting with a hidden/overlaid UI.

Security headers such as:

```text
X-Frame-Options
```

and modern CSP framing directives can help mitigate this.

Spring Security provides support for security headers.

---

# 100. API Security Architecture

A common modern architecture:

```text
                   +----------------+
                   | Identity       |
                   | Provider       |
                   +-------+--------+
                           |
                           | OAuth2/OIDC
                           |
                           v
+---------+        +---------------+
| Frontend| -----> | Spring Boot   |
|         | Bearer | Resource      |
|         | Token  | Server/API    |
+---------+        +-------+-------+
                           |
                           v
                       Services
                           |
                           v
                        Database
```

The frontend obtains an access token through an appropriate OAuth2/OIDC flow.

The API validates the access token.

---

# 101. API Gateway Architecture

For microservices:

```text
                    +----------------+
                    | Identity       |
                    | Provider       |
                    +-------+--------+
                            |
                            v
Client ---> API Gateway ---> Service A
                  |
                  +--------> Service B
                  |
                  +--------> Service C
```

Possible responsibilities:

```text
Gateway:
    routing
    rate limiting
    TLS termination
    coarse security

Services:
    token validation
    authorization
    business-level authorization
```

Do not assume:

```text
"Gateway authenticated the user, therefore internal services don't need authorization."
```

Internal services should still protect sensitive operations.

---

# 102. Service-to-Service Authentication

For microservices, services need identities too.

Possible approaches include:

```text
OAuth2 client credentials
mTLS
Service identity platforms
Cloud IAM
Signed tokens
```

Example OAuth2 client credentials architecture:

```text
Service A
   |
   | client credentials
   v
Authorization Server
   |
   v
Access Token
   |
   v
Service B
```

Use a mechanism appropriate for your infrastructure.

---

# 103. API Keys

API keys are sometimes used for:

```text
Third-party integrations
Internal tools
Simple service identification
```

But an API key is not automatically equivalent to OAuth2 authentication/authorization.

If you use API keys:

```text
Store securely
Rotate keys
Give keys scopes/permissions where possible
Rate limit
Revoke compromised keys
Never expose them to browsers unnecessarily
```

---

# 104. Token Storage

Where tokens are stored depends heavily on the application architecture.

Be particularly careful with browser applications.

Do not casually choose:

```text
localStorage
sessionStorage
cookies
memory
```

without considering:

```text
XSS
CSRF
token theft
refresh token theft
browser behavior
SameSite
Secure
HttpOnly
```

There is no universal "put every token in X" rule.

---

# 105. Cookies

For sensitive session cookies, commonly relevant attributes include:

```text
Secure
HttpOnly
SameSite
Path
Domain
```

For example:

```text
Secure
```

means send over HTTPS.

```text
HttpOnly
```

prevents normal JavaScript access.

```text
SameSite
```

controls cross-site cookie behavior.

The correct values depend on your application architecture.

---

# 106. SameSite Cookies

Common values:

```text
Strict
Lax
None
```

`SameSite=None` requires `Secure` in modern browsers.

Be careful when your architecture involves:

```text
Cross-site authentication
SSO
iframes
Separate frontend/backend domains
Third-party contexts
```

---

# 107. Stateless vs Stateful

## Stateful

Server stores authentication state.

```text
Browser
   |
   | session ID
   v
Server
   |
   v
Session store
```

Advantages:

```text
Easy revocation
Simple traditional web authentication
Server controls session lifecycle
```

Disadvantages:

```text
Requires session storage
Scaling requires shared session infrastructure or sticky sessions
```

---

## Stateless

Authentication information is carried in the token.

```text
Client
   |
   | JWT
   v
API
```

Advantages:

```text
No per-user server session required
Convenient for distributed APIs
```

Disadvantages:

```text
Token revocation is harder
Token theft is dangerous
Token size can grow
Authorization state can become stale
```

---

# 108. Stateless Does Not Mean "No Security State"

A common misconception:

```text
JWT = completely no state anywhere
```

In reality, systems may still maintain:

```text
Refresh token state
Revocation lists
Key state
User state
Session state elsewhere
Audit records
```

"Stateless API authentication" generally means the API does not need a server-side session for every request.

---

# 109. Token Revocation

JWTs are difficult to revoke individually if the resource server only validates:

```text
signature + expiration
```

Possible approaches:

```text
Short-lived access tokens
Refresh token rotation
Revocation lists
Token introspection
Key rotation
Session/version checks
```

Choose based on security requirements.

---

# 110. Key Rotation

Cryptographic keys should be rotatable.

For example:

```text
Old key -> K1
New key -> K2
```

During rotation:

```text
K2 signs new tokens
K1 remains available for verification
```

After all old tokens expire:

```text
K1 can be removed
```

Your identity provider/resource-server architecture should support appropriate key rotation.

---

# 111. Authentication vs Authorization Data

Avoid putting too much authorization state into long-lived tokens.

Suppose a JWT says:

```text
role = ADMIN
```

Then the user is demoted:

```text
ADMIN -> USER
```

but the old token may still say:

```text
ADMIN
```

until it expires.

This is one reason access-token lifetimes and authorization architecture matter.

---

# 112. Exception Handling

Spring Security commonly distinguishes:

```text
Authentication failure
Authorization failure
```

You can configure:

```java
http
    .exceptionHandling(exception -> exception
        .authenticationEntryPoint(...)
        .accessDeniedHandler(...)
    );
```

Conceptually:

```text
Unauthenticated
    -> AuthenticationEntryPoint
    -> 401

Authenticated but forbidden
    -> AccessDeniedHandler
    -> 403
```

---

# 113. REST API Error Responses

For APIs, you generally don't want an HTML login page.

You may want:

```json
{
  "status": 401,
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

and:

```json
{
  "status": 403,
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

Use a consistent API error format.

Avoid exposing internal security details.

---

# 114. Authentication Failure Messages

Do not reveal excessive details.

Bad:

```text
"Username exists but password is incorrect."
```

Better:

```text
"Invalid username or password."
```

Otherwise attackers can perform account enumeration.

---

# 115. Security Logging

Security events worth monitoring can include:

```text
Successful login
Failed login
Logout
Password change
Password reset
MFA changes
Privilege changes
Token failures
Suspicious authorization failures
Administrative actions
```

But do not log:

```text
Passwords
Access tokens
Refresh tokens
Session IDs
Client secrets
```

unless there is an extremely controlled, justified security design.

---

# 116. Audit Logging

For sensitive applications, maintain an audit trail:

```text
who
what
when
where
result
target
```

Example:

```text
User: alice
Action: DELETE_USER
Target: user-123
Time: 2026-08-22T10:30:00Z
Result: SUCCESS
```

Audit logs should themselves be protected against tampering.

---

# 117. Rate Limiting

Authentication endpoints are especially important:

```text
/login
/register
/password-reset
/otp
/token
```

Rate limiting helps reduce:

```text
Brute force
Credential stuffing
Automated abuse
Token abuse
```

Spring Security itself is not a complete distributed rate-limiting solution.

Rate limiting is often implemented using:

```text
API gateway
Reverse proxy
Redis
Cloud infrastructure
Dedicated rate limiter
```

---

# 118. Dependency Security

Security vulnerabilities can exist in dependencies.

Regularly inspect:

```text
Spring Boot
Spring Security
Spring Framework
Jackson
Netty
Tomcat
Database drivers
OAuth libraries
Logging libraries
```

Use:

```text
Dependabot
OWASP Dependency-Check
Snyk
Trivy
Maven/Gradle dependency auditing
```

and your organization's vulnerability-management tooling.

---

# 119. Keep Spring Security Updated

Security frameworks receive security fixes.

Do not stay indefinitely on old versions.

Follow:

```text
Spring Boot release updates
Spring Security security advisories
Dependency updates
```

Spring Security versions use major/minor/patch semantics, and major versions may include breaking changes.

---

# 120. Spring Security 6 vs 7

When maintaining older applications, you may encounter Spring Security 6 configurations.

Spring Security 7 is a major release with removed deprecated APIs and other breaking changes. The official migration guide recommends preparing applications on the final 6.x generation before moving to 7 where applicable.

Therefore:

```text
Old tutorial
     |
     v
Check Spring Security version
     |
     v
Check current API
     |
     v
Adapt configuration
```

Do not blindly copy old Stack Overflow answers.

---

# 121. `WebSecurityConfigurerAdapter`

Older tutorials may contain:

```java
extends WebSecurityConfigurerAdapter
```

This is not the modern configuration style.

Modern applications use:

```java
@Bean
SecurityFilterChain securityFilterChain(
        HttpSecurity http) throws Exception {
    ...
    return http.build();
}
```

When reading older tutorials, translate the configuration into the current bean-based model.

---

# 122. Multiple Security Filter Chains

Large applications may need different security rules for different URL spaces.

Conceptually:

```text
/api/**
   -> JWT authentication

/web/**
   -> session/form login
```

You can define multiple `SecurityFilterChain` beans and use request matching/order appropriately.

This is an advanced feature.

Use it when you genuinely have separate security models.

Do not introduce multiple chains unnecessarily because debugging becomes harder.

---

# 123. Filter Ordering

Security filters have an intentional order.

When adding custom filters, you may see:

```java
.addFilterBefore(...)
.addFilterAfter(...)
.addFilterAt(...)
```

Do not choose the location arbitrarily.

Ask:

```text
What authentication/security state must exist before my filter?
What filters need to execute before/after it?
```

If using standard authentication mechanisms, prefer built-in Spring Security support rather than custom filters.

---

# 124. Custom Filters

A custom filter can be useful for:

```text
Special headers
Custom authentication
Request correlation
Security-specific processing
```

But adding a filter unnecessarily can introduce bugs.

Do not create:

```text
JwtAuthenticationFilter
```

just because every tutorial has one.

If Spring Security's OAuth2 resource server already solves the problem, use it.

---

# 125. `OncePerRequestFilter`

A common custom-filter base class is:

```java
OncePerRequestFilter
```

Example:

```java
@Component
public class CustomSecurityFilter
        extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain)
            throws ServletException, IOException {

        // custom logic

        filterChain.doFilter(request, response);
    }
}
```

Again, use custom filters only when needed.

---

# 126. SecurityContext and Threads

The security context is associated with the current execution context.

Be careful when using:

```text
@Async
Thread pools
Executors
Background tasks
Reactive pipelines
```

Security context propagation needs to be handled correctly.

Do not assume:

```text
Current request user
```

will automatically be available in arbitrary background threads.

---

# 127. Reactive Spring Security

Spring Security also supports reactive applications.

Instead of:

```text
Servlet
HttpSecurity
SecurityFilterChain
```

you may encounter:

```text
WebFlux
ServerHttpSecurity
SecurityWebFilterChain
```

The concepts remain similar:

```text
Authentication
Authorization
SecurityContext
OAuth2
JWT
CSRF
```

but the APIs and execution model differ.

Do not mix servlet and reactive configuration examples.

---

# 128. Spring Security Test

For testing, include:

```xml
<dependency>
    <groupId>org.springframework.security</groupId>
    <artifactId>spring-security-test</artifactId>
    <scope>test</scope>
</dependency>
```

Spring Security provides dedicated testing support.

---

# 129. Testing Authentication

Example concept:

```java
@Test
@WithMockUser(username = "john", roles = "USER")
void userCanAccessEndpoint() {
}
```

You can test:

```text
Authenticated user
Roles
Authorities
Anonymous user
CSRF
Mock JWT
OAuth2 users
```

---

# 130. Testing Authorization

A good security test suite should verify both:

```text
Allowed cases
Denied cases
```

Example:

```text
USER:
GET /products -> 200

USER:
DELETE /products/1 -> 403

ADMIN:
DELETE /products/1 -> 200
```

Do not only test successful authentication.

Test unauthorized access explicitly.

---

# 131. CSRF Testing

For state-changing requests in session-based applications, tests should include the CSRF token where appropriate.

Conceptually:

```java
mockMvc.perform(
    post("/users")
        .with(csrf())
);
```

Also test that requests without the required CSRF protection fail where expected.

---

# 132. Mock JWT Testing

For resource-server APIs, Spring Security test support can allow you to simulate authenticated JWT requests without creating real tokens for every unit/integration test.

Conceptually:

```java
mockMvc.perform(
    get("/orders")
        .with(jwt())
);
```

Authorities/claims can be customized for the test.

---

# 133. Test Authorization at Multiple Levels

For sensitive operations, test:

```text
Controller authorization
Service authorization
Object ownership
Tenant isolation
Role/permission combinations
```

Example matrix:

```text
                 USER   ADMIN   OWNER   OTHER TENANT
READ                 Y      Y      Y          N
UPDATE               N      Y      Y          N
DELETE               N      Y      Y          N
```

Security tests should reflect business rules.

---

# 134. Integration Testing

Unit tests are not enough.

Use integration tests to verify:

```text
SecurityFilterChain
Authentication
JWT validation
Authorization
CSRF
CORS
Session behavior
Exception handling
```

A configuration can compile perfectly while having an incorrect security policy.

---

# 135. Security Testing Strategy

A practical testing pyramid:

```text
Unit tests
   |
   v
Service authorization tests
   |
   v
Controller/security integration tests
   |
   v
End-to-end security tests
   |
   v
Penetration/security testing
```

---

# 136. Common Mistake: Permit Everything

This:

```java
.authorizeHttpRequests(auth -> auth
    .anyRequest().permitAll()
)
```

effectively removes authorization requirements.

It may be fine temporarily during development.

Do not accidentally deploy it.

---

# 137. Common Mistake: Disable CSRF Without Understanding Why

Bad:

```java
.csrf(csrf -> csrf.disable())
```

because:

```text
"JWT tutorial did it."
```

Understand:

```text
How authentication is transported
Whether browser cookies are involved
Whether requests are cross-site
Whether the API is truly stateless
```

Then make the decision deliberately.

---

# 138. Common Mistake: Store Plain Passwords

Never:

```text
database.password = "secret123"
```

Use an appropriate password hashing mechanism.

---

# 139. Common Mistake: Encode Password Twice

Wrong:

```java
passwordEncoder.encode(
    passwordEncoder.encode(rawPassword)
);
```

Store one properly encoded password.

Then verify with:

```java
passwordEncoder.matches(
    rawPassword,
    storedPassword
);
```

---

# 140. Common Mistake: Compare Password Hashes Manually

Do not assume:

```java
passwordEncoder.encode(rawPassword)
    .equals(storedHash)
```

is the correct verification approach.

Password hashing may use salts, so repeated encoding can produce different results.

Use:

```java
passwordEncoder.matches(rawPassword, storedHash)
```

---

# 141. Common Mistake: Trusting a JWT Because It Is Decodable

This is wrong:

```text
JWT can be decoded
+
claims look correct
=
valid JWT
```

No.

You need proper validation, especially signature and relevant registered claims.

---

# 142. Common Mistake: Putting Secrets in JWT Payloads

Do not put:

```text
database password
client secret
API key
private information
```

into a normal JWT payload.

JWT payloads are generally readable by whoever possesses the token.

---

# 143. Common Mistake: Long-Lived Access Tokens

Avoid:

```text
Access token valid for 30 days
```

unless there is a strong reason and appropriate risk controls.

Shorter access-token lifetimes reduce the impact of token theft.

The exact lifetime depends on the application's requirements.

---

# 144. Common Mistake: Checking Only Roles

Suppose:

```text
ROLE_USER
```

is enough to access:

```text
GET /orders/123
```

But whose order?

You still need:

```text
user owns order 123
```

Authorization often has multiple dimensions:

```text
Identity
+
Role/permission
+
Resource ownership
+
Tenant
+
Business state
```

---

# 145. Common Mistake: Security Only in Controllers

If authorization exists only in controllers:

```text
Controller
   |
   v
Service
```

another caller might invoke the service through:

```text
Scheduled task
Message consumer
Another internal entry point
```

For important business authorization, method/service-level authorization can provide defense in depth.

---

# 146. Common Mistake: Returning Sensitive User Data

Never blindly serialize your security/domain entity:

```java
return user;
```

if it contains:

```text
password hash
reset token
security questions
internal flags
MFA secrets
```

Use response DTOs.

---

# 147. Common Mistake: Exposing Internal Errors

Avoid:

```json
{
  "error": "org.springframework.security...."
}
```

or stack traces in production.

Return controlled error responses.

Log detailed information securely on the server when appropriate.

---

# 148. Common Mistake: Overly Broad CORS

Avoid:

```text
Allow-Origin: *
```

when the application requires restricted origins.

Define the actual trusted frontend origins.

---

# 149. Common Mistake: Hard-Coding Allowed Origins

Avoid putting production domains directly throughout Java code.

Prefer configuration where practical:

```yaml
app:
  security:
    allowed-origins:
      - https://frontend.example.com
```

This also makes environment differences easier to manage.

---

# 150. Common Mistake: Relying on Client-Side Authorization

This is not security:

```javascript
if (user.isAdmin) {
    showDeleteButton();
}
```

That only changes the UI.

The backend must enforce:

```text
DELETE /users/123
```

authorization.

Attackers can call APIs directly.

---

# 151. UI Authorization vs API Authorization

Frontend:

```text
Hide admin button
```

is a usability feature.

Backend:

```text
hasAuthority("USER_DELETE")
```

is the actual security boundary.

Ideally implement both:

```text
Frontend:
    hide unavailable functionality

Backend:
    enforce authorization
```

---

# 152. Security Configuration Example — Traditional Web Application

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/",
                    "/login",
                    "/css/**",
                    "/js/**"
                ).permitAll()

                .requestMatchers("/admin/**")
                .hasRole("ADMIN")

                .anyRequest()
                .authenticated()
            )

            .formLogin(form -> form
                .loginPage("/login")
                .permitAll()
            )

            .logout(logout -> logout
                .permitAll()
            );

        return http.build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
```

This is appropriate as a conceptual starting point for a traditional server-rendered application.

---

# 153. Security Configuration Example — REST Resource Server

Conceptually:

```java
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(
            HttpSecurity http) throws Exception {

        http
            .csrf(csrf -> csrf.disable())

            .sessionManagement(session -> session
                .sessionCreationPolicy(
                    SessionCreationPolicy.STATELESS
                )
            )

            .authorizeHttpRequests(auth -> auth
                .requestMatchers(
                    "/public/**"
                ).permitAll()

                .requestMatchers(
                    "/admin/**"
                ).hasRole("ADMIN")

                .anyRequest()
                .authenticated()
            )

            .oauth2ResourceServer(oauth2 -> oauth2
                .jwt(Customizer.withDefaults())
            );

        return http.build();
    }
}
```

Again, CSRF configuration must be evaluated based on the actual token transport and browser architecture rather than copied mechanically.

---

# 154. Application Architecture Recommendation

For a reasonably complex Spring Boot application:

```text
controller/
service/
repository/
security/
dto/
config/
exception/
```

Security-related classes could include:

```text
security/
    SecurityConfig
    CustomUserDetails
    CustomUserDetailsService
    SecurityExceptionHandler
    CurrentUser
```

Do not put all authentication and authorization logic into one giant configuration class.

---

# 155. Separate Authentication From Business Authorization

A useful architecture:

```text
Authentication:
    Who is this user?

Authorization:
    What may this user do?

Business rules:
    Under what conditions may this action happen?
```

Example:

```text
Authentication:
    Alice is logged in.

Authorization:
    Alice has ORDER_CANCEL.

Business rule:
    Alice can cancel the order only if it has not shipped.
```

These are different concerns.

---

# 156. Security Configuration Should Be Readable

Avoid giant expressions such as:

```java
@PreAuthorize(
    "hasRole('ADMIN') and " +
    "(hasAuthority('X') or (...)) and " +
    "..."
)
```

If authorization becomes complex, consider moving the decision into a dedicated authorization component/service.

Readable security rules are easier to audit.

---

# 157. Security Constants

Avoid scattering strings:

```text
ROLE_ADMIN
USER_DELETE
ORDER_READ
```

through hundreds of classes.

Centralize them where appropriate:

```java
public final class SecurityAuthorities {

    public static final String USER_READ = "USER_READ";
    public static final String USER_DELETE = "USER_DELETE";

    private SecurityAuthorities() {
    }
}
```

This reduces spelling mistakes and makes refactoring easier.

---

# 158. Domain Authorization

Security decisions often belong to the domain.

Example:

```java
public boolean canCancel(Order order, User user) {

    return order.getUserId().equals(user.getId())
        && order.getStatus() == OrderStatus.PENDING;
}
```

This can be more maintainable than trying to express every business rule through URL configuration.

---

# 159. Defense in Depth

A strong application does not depend on one security mechanism.

Think:

```text
HTTPS
 +
Authentication
 +
Authorization
 +
Input validation
 +
CSRF protection where applicable
 +
Secure headers
 +
Rate limiting
 +
Secure password storage
 +
Database protection
 +
Dependency updates
 +
Logging/auditing
 +
Monitoring
```

If one layer fails, another layer may limit the damage.

---

# 160. Security Checklist — Development

Before considering security implementation complete:

* [ ] Authentication mechanism has been explicitly chosen.
* [ ] Authorization rules are documented.
* [ ] Public endpoints are explicitly identified.
* [ ] All other endpoints have an appropriate default.
* [ ] Passwords are never stored in plain text.
* [ ] Password hashes use an appropriate password hashing algorithm.
* [ ] Passwords are never logged.
* [ ] JWTs are properly validated if JWT authentication is used.
* [ ] Token expiration is enforced.
* [ ] Issuer validation is configured where applicable.
* [ ] Audience validation is considered where applicable.
* [ ] Roles/authorities are clearly defined.
* [ ] Resource ownership is checked where required.
* [ ] Tenant boundaries are enforced where applicable.
* [ ] CSRF requirements have been evaluated.
* [ ] CORS has been explicitly configured where needed.
* [ ] HTTPS is enforced in production.
* [ ] Security headers are reviewed.
* [ ] Secrets are not stored in source code.
* [ ] Sensitive fields are not exposed through DTOs/API responses.
* [ ] Authentication failures are handled safely.
* [ ] Authorization failures return appropriate responses.
* [ ] Security tests exist.
* [ ] Dependency vulnerabilities are monitored.

---

# 161. Security Checklist — Production

* [ ] HTTPS is enabled everywhere sensitive data is transmitted.
* [ ] HTTP redirects/configuration are correct.
* [ ] HSTS is configured appropriately.
* [ ] Production secrets come from a secure secret-management mechanism.
* [ ] Default generated Spring Security credentials are not being used.
* [ ] Debug logging is disabled or appropriately controlled.
* [ ] Authentication failures are monitored.
* [ ] Suspicious activity is monitored.
* [ ] Rate limiting exists where necessary.
* [ ] Login/password-reset endpoints are protected against abuse.
* [ ] Access tokens have appropriate lifetimes.
* [ ] Refresh tokens are handled securely.
* [ ] Token/key rotation procedures exist.
* [ ] Password reset tokens expire and are single-use.
* [ ] Session invalidation behavior is understood.
* [ ] CORS allows only required origins.
* [ ] Cookies have appropriate security attributes.
* [ ] Database credentials use least privilege.
* [ ] Dependency vulnerabilities are monitored.
* [ ] Audit logs are protected.
* [ ] Backups are protected.
* [ ] Incident-response procedures exist.
* [ ] Security configuration has been reviewed before release.

---

# 162. How to Debug Spring Security

When an endpoint unexpectedly returns `401`, ask:

```text
1. Is authentication being attempted?
2. Is the Authorization header present?
3. Is the token valid?
4. Is the token expired?
5. Is the issuer correct?
6. Is the audience correct?
7. Is the signing key correct?
8. Is the authentication provider configured?
9. Is the SecurityContext populated?
```

For `403`, ask:

```text
1. Is the user authenticated?
2. What authorities does the user have?
3. What authority does the endpoint require?
4. Is ROLE_ prefix involved?
5. Is method security denying the call?
6. Is object ownership failing?
7. Is tenant authorization failing?
```

---

# 163. Debugging Roles

Suppose:

```java
.hasRole("ADMIN")
```

is failing.

Check:

```text
Actual authority:
ROLE_ADMIN
```

not:

```text
ADMIN
```

For:

```java
.hasAuthority("ADMIN")
```

the authority must actually be:

```text
ADMIN
```

This small distinction causes many Spring Security bugs.

---

# 164. Debugging JWT

If a JWT request gets `401`, inspect:

```text
Authorization header
        |
        v
Bearer token
        |
        +-- signature valid?
        +-- issuer valid?
        +-- expiration valid?
        +-- audience valid?
        +-- key available?
        +-- token format valid?
```

If JWT authentication succeeds but endpoint returns `403`:

```text
Authentication succeeded
        |
        v
Authorities probably don't match
```

Inspect:

```text
scope
scp
roles
authorities
```

and the mapping configuration.

---

# 165. Recommended Mental Model

Think of every request as passing through these questions:

```text
1. What request is this?

2. Is the endpoint public?

3. If not, how is the caller authenticated?

4. Is authentication valid?

5. Who is the authenticated principal?

6. What authorities does the principal have?

7. Is the principal authorized for this endpoint?

8. Is the principal authorized for this specific resource?

9. Is the request safe from relevant web attacks?

10. Can the operation be audited?
```

---

# 166. Spring Security Learning Order

A practical learning sequence is:

```text
1. Authentication vs Authorization

2. SecurityFilterChain

3. HttpSecurity

4. requestMatchers()

5. hasRole()
6. hasAuthority()

7. UserDetails
8. UserDetailsService

9. PasswordEncoder

10. AuthenticationManager
11. AuthenticationProvider

12. SecurityContext

13. Form Login

14. Session Management

15. CSRF

16. CORS

17. Security Headers

18. Method Security

19. JWT

20. OAuth2 Resource Server

21. OAuth2/OIDC Login

22. Refresh Tokens

23. Key Rotation

24. Object-Level Authorization

25. Testing

26. Production Security
```

Do not start by memorizing dozens of filters.

Understand the architecture first.

---

# 167. The Most Important Classes to Know

You do not need to memorize every Spring Security class.

Start with:

```text
SecurityFilterChain
HttpSecurity
Authentication
SecurityContext
SecurityContextHolder
UserDetails
UserDetailsService
PasswordEncoder
AuthenticationManager
AuthenticationProvider
GrantedAuthority
SecurityContextRepository
AuthenticationEntryPoint
AccessDeniedHandler
```

For JWT/OAuth2:

```text
JwtDecoder
JwtAuthenticationToken
JwtAuthenticationConverter
BearerTokenAuthenticationFilter
OAuth2ResourceServer
```

For method security:

```text
@EnableMethodSecurity
@PreAuthorize
@PostAuthorize
@Secured
@RolesAllowed
```

---

# 168. The Most Important Configuration Methods

Become familiar with:

```java
authorizeHttpRequests(...)
requestMatchers(...)
permitAll()
authenticated()
hasRole(...)
hasAnyRole(...)
hasAuthority(...)
hasAnyAuthority(...)
formLogin(...)
httpBasic(...)
logout(...)
csrf(...)
cors(...)
sessionManagement(...)
exceptionHandling(...)
oauth2ResourceServer(...)
oauth2Login(...)
```

Do not memorize blindly.

Understand what security decision each one represents.

---

# 169. A Complete Conceptual Request

Consider:

```http
GET /api/orders/123
Authorization: Bearer eyJ...
```

Spring Security conceptually performs:

```text
HTTP request
      |
      v
Security filters
      |
      v
Bearer token extracted
      |
      v
JWT validated
      |
      v
Authentication created
      |
      v
SecurityContext populated
      |
      v
Authorization rules evaluated
      |
      v
Controller
      |
      v
Service
      |
      v
Object-level authorization
      |
      v
Database
      |
      v
Response
```

If any security condition fails:

```text
401
or
403
```

depending on the failure.

---

# 170. Authentication vs Authorization — Final Mental Model

Remember:

```text
Authentication
===============
WHO are you?

Example:
    Alice

Authorization
=============
WHAT can you do?

Example:
    USER_READ
    ORDER_CREATE

Resource Authorization
======================
WHAT can you do WITH THIS PARTICULAR RESOURCE?

Example:
    Alice can update Order #123
    Alice cannot update Order #456
```

The third category is where many real-world security bugs occur.

---

# 171. Recommended Production Architecture

For a modern REST API:

```text
                     +--------------------+
                     | Identity Provider  |
                     | OIDC / OAuth2      |
                     +---------+----------+
                               |
                               | Access Token
                               v
+-------------+       +--------------------+
| Web / Mobile| ----> | Spring Boot API    |
| Client      |       | Resource Server    |
+-------------+       +---------+----------+
                                |
                                v
                       Authentication
                                |
                                v
                       Authorization
                                |
                    +-----------+-----------+
                    |                       |
                    v                       v
              Method Security       Object Authorization
                    |                       |
                    +-----------+-----------+
                                |
                                v
                             Service
                                |
                                v
                            Database
```

Cross-cutting protections:

```text
HTTPS
CORS
CSRF where applicable
Security headers
Rate limiting
Logging
Auditing
Monitoring
Dependency scanning
Secret management
```

---

# 172. Best Practices Summary

## Authentication

```text
Use established authentication mechanisms.
Do not implement cryptography yourself.
Use an identity provider where appropriate.
Use MFA for sensitive applications.
Use short-lived access tokens where appropriate.
```

## Passwords

```text
Never store plain passwords.
Use a password hashing mechanism.
Never log passwords.
Support secure password reset.
Protect login endpoints against abuse.
```

## Authorization

```text
Use least privilege.
Prefer explicit authorization.
Deny by default.
Check resource ownership.
Check tenant boundaries.
Do not rely on frontend authorization.
```

## JWT/OAuth2

```text
Validate signatures.
Validate issuer.
Validate expiration.
Validate audience when applicable.
Map scopes/roles correctly.
Use appropriate token lifetimes.
Plan for key rotation.
```

## Web Security

```text
Use HTTPS.
Understand CSRF.
Configure CORS narrowly.
Use secure cookies.
Use security headers.
Protect against XSS.
Validate input.
```

## Code

```text
Prefer SecurityFilterChain.
Avoid obsolete configuration tutorials.
Avoid unnecessary custom filters.
Use DTOs.
Keep security rules readable.
```

## Operations

```text
Manage secrets securely.
Monitor authentication failures.
Audit sensitive operations.
Rate limit sensitive endpoints.
Keep dependencies updated.
Have an incident-response process.
```

---

# 173. Useful Official Documentation

Spring Security reference documentation:

https://docs.spring.io/spring-security/reference/

Spring Boot security documentation:

https://docs.spring.io/spring-boot/reference/security/index.html

Spring Security getting started:

https://docs.spring.io/spring-security/reference/servlet/getting-started.html

Spring Security authorization documentation:

https://docs.spring.io/spring-security/reference/7.0/servlet/authorization/index.html

Spring Security currently documents the framework as providing authentication, authorization, and protection against common exploits, with support for both servlet and reactive applications.

---

# 174. Final Cheat Sheet

```text
Spring Security
│
├── Authentication
│   ├── Form Login
│   ├── HTTP Basic
│   ├── UserDetailsService
│   ├── LDAP
│   ├── OAuth2 Login
│   ├── OIDC
│   └── JWT / Bearer Tokens
│
├── Authorization
│   ├── requestMatchers
│   ├── authenticated
│   ├── permitAll
│   ├── hasRole
│   ├── hasAuthority
│   ├── Method Security
│   └── Object-Level Authorization
│
├── Password Security
│   ├── PasswordEncoder
│   ├── BCrypt
│   ├── Password Reset
│   └── Brute-Force Protection
│
├── Session Security
│   ├── Sessions
│   ├── Session Fixation
│   ├── Logout
│   └── Stateless APIs
│
├── Web Security
│   ├── CSRF
│   ├── CORS
│   ├── Security Headers
│   ├── HTTPS
│   ├── HSTS
│   └── Cookies
│
├── OAuth2
│   ├── Authorization Server
│   ├── Resource Server
│   ├── OAuth2 Client
│   ├── Access Tokens
│   ├── Refresh Tokens
│   └── PKCE
│
├── JWT
│   ├── Signature
│   ├── Claims
│   ├── Issuer
│   ├── Audience
│   ├── Expiration
│   └── Key Rotation
│
├── Architecture
│   ├── SecurityFilterChain
│   ├── AuthenticationManager
│   ├── AuthenticationProvider
│   ├── SecurityContext
│   └── GrantedAuthority
│
├── Application Security
│   ├── Input Validation
│   ├── XSS
│   ├── SQL Injection
│   ├── IDOR/BOLA
│   ├── Tenant Isolation
│   └── Mass Assignment
│
├── Operations
│   ├── Secrets
│   ├── Logging
│   ├── Auditing
│   ├── Rate Limiting
│   ├── Monitoring
│   └── Dependency Updates
│
└── Testing
    ├── Authentication Tests
    ├── Authorization Tests
    ├── CSRF Tests
    ├── JWT Tests
    ├── Integration Tests
    └── End-to-End Tests
```

---

# 175. One-Page Mental Model

If you remember only one thing, remember this:

```text
                    REQUEST
                       |
                       v
              +----------------+
              | Security       |
              | Filter Chain   |
              +--------+-------+
                       |
                       v
              Is authentication
              required?
                 /         \
               NO           YES
               |             |
               |             v
               |       Authenticate
               |             |
               |       +-----+-----+
               |       |           |
               |     FAIL        SUCCESS
               |       |           |
               |      401          v
               |           SecurityContext
               |                 |
               +--------+--------+
                        |
                        v
                  Authorization
                        |
                 +------+------+
                 |             |
               DENY          ALLOW
                 |             |
                403            v
                        Controller
                            |
                            v
                         Service
                            |
                            v
                 Resource/Object check
                            |
                            v
                         Database
```

And the core distinction:

```text
Authentication = WHO are you?

Authorization = WHAT are you allowed to do?

Object authorization = ARE you allowed to do it to THIS resource?

Security engineering = WHAT ELSE could go wrong around the entire system?
```

That mental model is more valuable than memorizing individual Spring Security APIs.
