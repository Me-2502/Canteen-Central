# Spring Boot + JPA + Hibernate — Complete Reference Notes

> A practical and detailed reference for learning, developing, debugging, optimizing, and preparing for interviews with Spring Boot, JPA, Hibernate, and Spring Data JPA.

---

## Table of Contents

1. [Big Picture](#1-big-picture)
2. [Spring Boot vs JPA vs Hibernate vs Spring Data JPA](#2-spring-boot-vs-jpa-vs-hibernate-vs-spring-data-jpa)
3. [Prerequisites](#3-prerequisites)
4. [Project Setup](#4-project-setup)
5. [Database Configuration](#5-database-configuration)
6. [Entities](#6-entities)
7. [Primary Keys and ID Generation](#7-primary-keys-and-id-generation)
8. [Columns and Basic Mappings](#8-columns-and-basic-mappings)
9. [Entity Lifecycle](#9-entity-lifecycle)
10. [Persistence Context](#10-persistence-context)
11. [Dirty Checking](#11-dirty-checking)
12. [Flush and Commit](#12-flush-and-commit)
13. [Entity Relationships](#13-entity-relationships)
14. [Many-to-One](#14-many-to-one)
15. [One-to-Many](#15-one-to-many)
16. [One-to-One](#16-one-to-one)
17. [Many-to-Many](#17-many-to-many)
18. [Owning Side and mappedBy](#18-owning-side-and-mappedby)
19. [Cascade Types](#19-cascade-types)
20. [orphanRemoval](#20-orphanremoval)
21. [Fetch Types](#21-fetch-types)
22. [Lazy Loading](#22-lazy-loading)
23. [LazyInitializationException](#23-lazyinitializationexception)
24. [N+1 Query Problem](#24-n1-query-problem)
25. [Solving N+1](#25-solving-n1)
26. [Repositories](#26-repositories)
27. [Derived Query Methods](#27-derived-query-methods)
28. [JPQL](#28-jpql)
29. [HQL](#29-hql)
30. [Native SQL Queries](#30-native-sql-queries)
31. [DTOs and Projections](#31-dtos-and-projections)
32. [EntityGraph](#32-entitygraph)
33. [Specifications](#33-specifications)
34. [Pagination and Sorting](#34-pagination-and-sorting)
35. [Transactions](#35-transactions)
36. [Transaction Propagation](#36-transaction-propagation)
37. [Rollback Rules](#37-rollback-rules)
38. [Self-Invocation Problem](#38-self-invocation-problem)
39. [Optimistic Locking](#39-optimistic-locking)
40. [Pessimistic Locking](#40-pessimistic-locking)
41. [Concurrency](#41-concurrency)
42. [Caching](#42-caching)
43. [Batch Processing](#43-batch-processing)
44. [JDBC Batching](#44-jdbc-batching)
45. [Embeddables and Value Objects](#45-embeddables-and-value-objects)
46. [Enums](#46-enums)
47. [Date and Time](#47-date-and-time)
48. [Auditing](#48-auditing)
49. [Inheritance](#49-inheritance)
50. [equals(), hashCode() and toString()](#50-equals-hashcode-and-tostring)
51. [Lombok and JPA](#51-lombok-and-jpa)
52. [Database Indexes](#52-database-indexes)
53. [Constraints](#53-constraints)
54. [Database Migrations](#54-database-migrations)
55. [Soft Delete](#55-soft-delete)
56. [Bulk Updates and Deletes](#56-bulk-updates-and-deletes)
57. [EntityManager](#57-entitymanager)
58. [Open EntityManager in View](#58-open-entitymanager-in-view)
59. [Connection Pooling](#59-connection-pooling)
60. [Performance Optimization](#60-performance-optimization)
61. [Testing](#61-testing)
62. [Testcontainers](#62-testcontainers)
63. [Recommended Architecture](#63-recommended-architecture)
64. [Production Best Practices](#64-production-best-practices)
65. [Common Mistakes](#65-common-mistakes)
66. [Interview Questions](#66-interview-questions)
67. [Quick Revision Cheat Sheet](#67-quick-revision-cheat-sheet)

---

# 1. Big Picture

Before learning individual annotations, understand how all the technologies fit together.

```text
                    Spring Boot Application
                            |
                            v
                       Controller
                            |
                            v
                         Service
                      @Transactional
                            |
                            v
                       Repository
                            |
                            v
                    Spring Data JPA
                            |
                            v
                     JPA / Jakarta
                     Persistence API
                            |
                            v
                        Hibernate
                            |
                            v
                           JDBC
                            |
                            v
                     Connection Pool
                            |
                            v
                         Database
```

There are several layers here, and they are not the same thing.

### Spring Boot

Spring Boot provides application configuration and auto-configuration.

It can automatically configure:

* DataSource
* Connection pool
* JPA
* Hibernate
* Transaction management
* Spring Data repositories
* Database initialization
* Various production features

You generally configure the application rather than manually constructing all these objects.

---

### JPA / Jakarta Persistence

JPA is a specification/API for persistence.

Modern applications use the Jakarta namespace:

```java
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;
```

JPA defines concepts such as:

* `@Entity`
* `@Id`
* `@OneToMany`
* `@ManyToOne`
* `EntityManager`
* Persistence Context
* JPQL
* Entity lifecycle
* Locking

JPA itself is not the database implementation.

---

### Hibernate

Hibernate is an implementation of the Jakarta Persistence specification.

Hibernate performs tasks such as:

* Mapping Java objects to database tables
* Generating SQL
* Tracking managed entities
* Dirty checking
* Lazy loading
* Managing persistence context
* First-level caching
* Query execution
* Relationship handling

Hibernate also provides features beyond standard JPA.

---

### Spring Data JPA

Spring Data JPA sits above JPA.

It provides repository abstractions such as:

```java
public interface UserRepository
        extends JpaRepository<User, Long> {
}
```

Instead of writing repetitive CRUD code manually, Spring Data can generate the implementation.

For example:

```java
userRepository.findById(id);
userRepository.findAll();
userRepository.save(user);
userRepository.delete(user);
```

---

# 2. Spring Boot vs JPA vs Hibernate vs Spring Data JPA

This distinction is frequently asked in interviews.

| Technology                | Main responsibility                      |
| ------------------------- | ---------------------------------------- |
| Spring Boot               | Application setup and auto-configuration |
| JPA / Jakarta Persistence | Persistence specification/API            |
| Hibernate                 | JPA implementation / ORM engine          |
| Spring Data JPA           | Repository abstraction over JPA          |
| JDBC                      | Low-level Java database communication    |
| Database                  | Actual persistent storage                |

A useful mental model is:

```text
Spring Boot
    ↓
Spring Data JPA
    ↓
JPA
    ↓
Hibernate
    ↓
JDBC
    ↓
Database
```

You can use Hibernate without Spring Boot.

You can use JPA without Hibernate because JPA is only a specification and can have other implementations.

Spring Data JPA is not the same thing as JPA.

---

# 3. Prerequisites

Before becoming comfortable with Hibernate, you should understand SQL.

At minimum, know:

```sql
SELECT
INSERT
UPDATE
DELETE

WHERE
ORDER BY
GROUP BY
HAVING

INNER JOIN
LEFT JOIN
RIGHT JOIN

DISTINCT
LIMIT
OFFSET

COUNT
SUM
AVG
MIN
MAX
```

Also understand:

* Primary keys
* Foreign keys
* Unique constraints
* Composite keys
* Indexes
* Transactions
* ACID
* Isolation levels
* Deadlocks
* Normalization
* Query execution plans

Hibernate can generate SQL for you, but it does not remove the need to understand SQL.

A developer who does not understand SQL will have difficulty diagnosing Hibernate performance problems.

---

# 4. Project Setup

A typical Spring Boot application needs the Spring Data JPA starter.

For Maven:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```

Then add the appropriate database driver.

For PostgreSQL:

```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

For MySQL:

```xml
<dependency>
    <groupId>com.mysql</groupId>
    <artifactId>mysql-connector-j</artifactId>
    <scope>runtime</scope>
</dependency>
```

Do not manually choose a random Hibernate version when Spring Boot already manages a compatible version.

The Spring Boot dependency-management system exists to keep the Spring ecosystem and its dependencies compatible.

---

# 5. Database Configuration

A typical `application.yml` could look like:

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/myapp
    username: postgres
    password: postgres

  jpa:
    hibernate:
      ddl-auto: validate

    properties:
      hibernate:
        format_sql: true

    open-in-view: false
```

Equivalent properties:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/myapp
spring.datasource.username=postgres
spring.datasource.password=postgres

spring.jpa.hibernate.ddl-auto=validate
spring.jpa.open-in-view=false
```

---

## 5.1 `ddl-auto`

Common values:

```text
none
validate
update
create
create-drop
```

### `none`

Hibernate does not manage schema creation/update.

### `validate`

Hibernate checks whether the database schema matches the entity mappings.

This is often a good production setting when migrations are managed separately.

### `update`

Hibernate attempts to update the schema automatically.

This is convenient during development but should generally not be used as the production migration strategy.

### `create`

Creates the schema when the application starts.

Existing schema/data can be destroyed depending on the environment/configuration.

### `create-drop`

Creates the schema at startup and drops it when the application shuts down.

Useful mainly for temporary development/testing scenarios.

---

## 5.2 Recommended production approach

Prefer:

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: validate
```

and manage schema changes through:

* Flyway
* Liquibase
* Controlled SQL migrations

This gives you version-controlled database changes.

---

# 6. Entities

An entity is a Java class whose instances are persisted to the database.

Example:

```java
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    protected User() {
    }

    public User(String name, String email) {
        this.name = name;
        this.email = email;
    }
}
```

Conceptually:

```text
Java class      -> Database table
Java object     -> Database row
Java field      -> Database column
Java reference  -> Foreign-key relationship
```

---

# 7. Primary Keys and ID Generation

Every entity needs an identifier.

Basic:

```java
@Id
private Long id;
```

Usually you want generated identifiers:

```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
```

Common generation strategies include:

```java
GenerationType.IDENTITY
GenerationType.SEQUENCE
GenerationType.TABLE
GenerationType.UUID
```

The correct strategy depends on your database and requirements.

---

## 7.1 IDENTITY

Example:

```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
```

The database generates the ID, commonly using an auto-increment/identity mechanism.

Simple and widely used.

However, database-generated IDs can affect Hibernate's ability to batch inserts efficiently depending on the database and generation strategy.

---

## 7.2 SEQUENCE

For databases such as PostgreSQL, sequences are often useful:

```java
@Id
@GeneratedValue(strategy = GenerationType.SEQUENCE)
private Long id;
```

You can explicitly configure a sequence:

```java
@SequenceGenerator(
    name = "user_seq",
    sequenceName = "user_seq",
    allocationSize = 50
)
@GeneratedValue(
    strategy = GenerationType.SEQUENCE,
    generator = "user_seq"
)
private Long id;
```

Sequence allocation can reduce database round trips.

---

## 7.3 UUID

UUIDs are useful when you need identifiers that are difficult to guess and/or globally unique.

Example:

```java
@Id
private UUID id;
```

However, UUIDs can have storage/indexing implications compared with numeric identifiers.

Don't choose UUIDs simply because they are fashionable. Choose them based on the requirements of your system.

---

# 8. Columns and Basic Mappings

Use `@Column` to customize database mapping.

```java
@Column(
    name = "first_name",
    nullable = false,
    length = 100
)
private String firstName;
```

Common properties include:

```text
name
nullable
unique
length
precision
scale
insertable
updatable
```

---

## 8.1 `@Transient`

If a field should not be persisted:

```java
@Transient
private String displayName;
```

Be careful to use:

```java
jakarta.persistence.Transient
```

for JPA persistence behavior.

---

## 8.2 `@Lob`

For large values:

```java
@Lob
private String description;
```

or binary data where appropriate.

However, don't automatically store large files such as videos/images inside the database.

For many systems, object storage is a better architecture.

---

# 9. Entity Lifecycle

An entity can be in several conceptual states.

```text
              persist()
Transient -----------------> Managed
                              |
                              |
                         detach / clear
                              |
                              v
                           Detached
                              |
                              |
                           remove()
                              |
                              v
                           Removed
```

---

## 9.1 Transient

A newly created object:

```java
User user = new User("John", "john@example.com");
```

Hibernate is not managing it yet.

---

## 9.2 Managed

Once associated with the persistence context:

```java
entityManager.persist(user);
```

Hibernate tracks changes.

---

## 9.3 Detached

An entity can become detached when:

```java
entityManager.detach(user);
```

or:

```java
entityManager.clear();
```

or when its persistence context ends.

Changes made to a detached object are not automatically tracked.

---

## 9.4 Removed

An entity can be marked for deletion:

```java
entityManager.remove(user);
```

The SQL `DELETE` generally happens during flush/transaction synchronization.

---

# 10. Persistence Context

The persistence context is one of the most important Hibernate concepts.

Think of it as a managed collection of entities associated with a particular persistence context.

```text
                Persistence Context
                       |
          +------------+------------+
          |            |            |
        User        Order       Product
```

Hibernate knows the state of these entities.

If you load:

```java
User user = entityManager.find(User.class, 1L);
```

then modify:

```java
user.setName("John");
```

Hibernate can detect that change.

You don't necessarily need to call:

```java
repository.save(user);
```

for a managed entity.

---

# 11. Dirty Checking

Dirty checking means Hibernate detects changes made to managed entities.

Example:

```java
@Transactional
public void renameUser(Long id) {

    User user = userRepository
            .findById(id)
            .orElseThrow();

    user.setName("John");
}
```

You didn't explicitly call:

```java
userRepository.save(user);
```

Hibernate can detect:

```text
Before:
name = Alice

After:
name = John
```

and generate something similar to:

```sql
UPDATE users
SET name = ?
WHERE id = ?
```

when the persistence context is flushed.

This is one of Hibernate's most important features.

---

# 12. Flush and Commit

These concepts are related but not identical.

### Flush

Flush synchronizes the persistence context with the database.

```text
Managed Entity
      |
      | flush
      v
SQL statements
      |
      v
Database
```

### Commit

Commit completes the database transaction.

Conceptually:

```text
BEGIN
   |
   | application operations
   |
   | flush
   v
SQL executed
   |
   | COMMIT
   v
Transaction completed
```

A flush does not necessarily mean the transaction has committed.

---

## 12.1 Explicit flush

You can force a flush:

```java
entityManager.flush();
```

or:

```java
repository.flush();
```

Don't call `flush()` after every operation without a reason.

Excessive flushing can hurt performance.

---

# 13. Entity Relationships

The four primary JPA relationship mappings are:

```java
@OneToOne
@OneToMany
@ManyToOne
@ManyToMany
```

The database relationship is usually represented using foreign keys.

For example:

```text
Department
    |
    +---- Employee
    |
    +---- Employee
    |
    +---- Employee
```

This is:

```text
Department 1 ---- N Employee
```

---

# 14. Many-to-One

Suppose many employees belong to one department.

Database:

```text
department
----------------
id
name

employee
----------------
id
name
department_id
```

Entity:

```java
@Entity
public class Employee {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id")
    private Department department;
}
```

This is usually the side that owns the foreign key.

---

## 14.1 Why `LAZY`?

The employee table already contains `department_id`.

Loading an employee does not necessarily mean you need the entire department object immediately.

Therefore:

```java
@ManyToOne(fetch = FetchType.LAZY)
```

is often a better default.

---

# 15. One-to-Many

The department can have:

```java
@OneToMany(
    mappedBy = "department",
    fetch = FetchType.LAZY
)
private List<Employee> employees = new ArrayList<>();
```

The important part is:

```java
mappedBy = "department"
```

This says:

> The `department` field in `Employee` owns this relationship.

The value of `mappedBy` is the Java property name, not the database column name.

---

# 16. One-to-One

Example:

```text
User 1 ---- 1 Profile
```

One possible mapping:

```java
@OneToOne
@JoinColumn(name = "profile_id")
private Profile profile;
```

Another database design is to put the foreign key on the profile table:

```text
profile
----------------
id
user_id UNIQUE
```

The correct design depends on ownership and lifecycle requirements.

Don't choose the mapping only because the Java classes happen to look like a one-to-one relationship.

---

# 17. Many-to-Many

Example:

```text
Student
   |
   +---- Course
   |
   +---- Course
```

and:

```text
Course
   |
   +---- Student
```

A relational database normally uses a join table:

```text
student
course
student_course
```

Example:

```java
@ManyToMany
@JoinTable(
    name = "student_course",
    joinColumns = @JoinColumn(name = "student_id"),
    inverseJoinColumns = @JoinColumn(name = "course_id")
)
private Set<Course> courses = new HashSet<>();
```

---

## 17.1 Why Many-to-Many can become problematic

Suppose the relationship needs additional information:

```text
student
course
enrollment_date
grade
status
```

A simple `@ManyToMany` is no longer sufficient.

Instead model:

```text
Student
   |
   v
Enrollment
   |
   v
Course
```

`Enrollment` becomes an entity.

This is often easier to query, validate, audit, and evolve.

---

# 18. Owning Side and `mappedBy`

This is extremely important.

Consider:

```java
@Entity
public class Employee {

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;
}
```

and:

```java
@Entity
public class Department {

    @OneToMany(mappedBy = "department")
    private List<Employee> employees;
}
```

The owning side is:

```java
Employee.department
```

because that side controls the foreign key.

The `Department.employees` side is the inverse side.

---

## 18.1 Keeping both sides synchronized

For bidirectional relationships, use helper methods.

```java
public void addEmployee(Employee employee) {
    employees.add(employee);
    employee.setDepartment(this);
}

public void removeEmployee(Employee employee) {
    employees.remove(employee);
    employee.setDepartment(null);
}
```

Then callers can simply do:

```java
department.addEmployee(employee);
```

instead of remembering to update both sides manually.

---

# 19. Cascade Types

Cascade controls whether persistence operations propagate from one entity to associated entities.

Available cascade types include:

```text
PERSIST
MERGE
REMOVE
REFRESH
DETACH
ALL
```

Example:

```java
@OneToMany(
    mappedBy = "order",
    cascade = CascadeType.ALL
)
private List<OrderItem> items;
```

---

## 19.1 Cascade PERSIST

When the parent is persisted, the child can also be persisted.

```text
Order
  |
  +--- OrderItem
```

Persisting the order can persist its items.

---

## 19.2 Cascade REMOVE

Deleting the parent can delete the child.

Use this only when the child is truly owned by the parent.

For example:

```text
Order
  |
  +--- OrderItem
```

Deleting an order may reasonably delete its order items.

But:

```text
Customer
  |
  +--- Order
```

Deleting a customer should not necessarily delete historical orders.

---

## 19.3 `CascadeType.ALL`

`ALL` means all cascade operations.

It is convenient, but do not use it blindly.

The cascade configuration should represent actual domain ownership.

---

# 20. orphanRemoval

Example:

```java
@OneToMany(
    mappedBy = "order",
    cascade = CascadeType.ALL,
    orphanRemoval = true
)
private List<OrderItem> items = new ArrayList<>();
```

If an item is removed from the collection:

```java
order.getItems().remove(item);
```

Hibernate can delete that child from the database.

This is useful for true parent-child ownership.

A useful question is:

> Can this child exist meaningfully without this parent?

If the answer is no, `orphanRemoval` may be appropriate.

---

# 21. Fetch Types

JPA primarily defines:

```java
FetchType.LAZY
FetchType.EAGER
```

### LAZY

The relationship is loaded when needed.

### EAGER

The relationship is requested as part of loading the entity.

For example:

```java
@ManyToOne(fetch = FetchType.LAZY)
private Department department;
```

---

## 21.1 Why prefer LAZY?

Suppose you load:

```text
User
```

but the user has:

```text
Orders
Addresses
Roles
Permissions
Company
Department
Audit records
```

If everything is eagerly loaded, one simple user lookup can become a huge database operation.

Prefer:

```text
Default relationship = LAZY
Use-case-specific fetch = explicit
```

This makes data access more predictable.

---

# 22. Lazy Loading

Suppose:

```java
Employee employee =
    employeeRepository.findById(id)
        .orElseThrow();
```

and:

```java
employee.getDepartment().getName();
```

If `department` is lazy, Hibernate can execute another query when the relationship is accessed.

Conceptually:

```text
SELECT employee...

then later:

SELECT department...
```

This is convenient, but it can also cause unexpected queries.

---

# 23. LazyInitializationException

A common problem:

```java
public Employee getEmployee(Long id) {
    return repository.findById(id)
        .orElseThrow();
}
```

Then later, after the persistence context is closed:

```java
employee.getDepartment().getName();
```

Hibernate may not be able to initialize the lazy relationship.

You can get:

```text
LazyInitializationException
```

---

## 23.1 Don't solve it by making everything EAGER

A common beginner reaction is:

```java
@ManyToOne(fetch = FetchType.EAGER)
```

This can hide the problem while creating performance issues elsewhere.

Better solutions include:

* Fetch joins
* Entity graphs
* DTO projections
* Proper transaction boundaries
* Explicitly fetching required relationships

---

# 24. N+1 Query Problem

This is one of the most important Hibernate performance problems.

Suppose:

```java
List<Order> orders = orderRepository.findAll();
```

Then:

```java
for (Order order : orders) {
    System.out.println(
        order.getCustomer().getName()
    );
}
```

Potential SQL:

```sql
SELECT * FROM orders;

SELECT * FROM customers WHERE id = 1;
SELECT * FROM customers WHERE id = 2;
SELECT * FROM customers WHERE id = 3;
SELECT * FROM customers WHERE id = 4;
...
```

If there are 100 orders:

```text
1 query + 100 customer queries
= 101 queries
```

This is the N+1 problem.

---

# 25. Solving N+1

There are several approaches.

---

## 25.1 JOIN FETCH

```java
@Query("""
    select o
    from Order o
    join fetch o.customer
""")
List<Order> findOrdersWithCustomer();
```

Hibernate can retrieve orders and customers in a single query.

---

## 25.2 EntityGraph

```java
@EntityGraph(attributePaths = {"customer"})
List<Order> findAll();
```

This is useful when you want to customize fetching for a particular repository operation.

---

## 25.3 DTO projection

Instead of loading entire entities:

```java
public record OrderSummary(
    Long orderId,
    String customerName
) {}
```

Query only the data required by the API/use case.

This can be much more efficient.

---

## 25.4 Batch fetching

Hibernate can batch lazy relationship loading.

Instead of:

```text
SELECT customer 1
SELECT customer 2
SELECT customer 3
SELECT customer 4
```

it can potentially use:

```sql
SELECT *
FROM customer
WHERE id IN (?, ?, ?, ?);
```

Batch fetching should be configured based on actual workload.

---

# 26. Repositories

A common repository:

```java
public interface UserRepository
        extends JpaRepository<User, Long> {
}
```

This gives access to many operations.

Examples:

```java
save(user);

findById(id);

findAll();

existsById(id);

count();

delete(user);

deleteById(id);
```

Spring Data creates the implementation for you.

---

# 27. Derived Query Methods

Spring Data can generate queries from method names.

Example:

```java
List<User> findByName(String name);
```

More examples:

```java
Optional<User> findByEmail(String email);

List<User> findByStatus(Status status);

List<User> findByAgeGreaterThan(int age);

List<User> findByAgeBetween(int min, int max);

List<User> findByNameContaining(String name);

List<User> findByNameStartingWith(String prefix);

List<User> findByNameIgnoreCase(String name);
```

---

## 27.1 Multiple conditions

```java
List<User> findByFirstNameAndLastName(
    String firstName,
    String lastName
);
```

Conceptually:

```sql
WHERE first_name = ?
AND last_name = ?
```

---

## 27.2 OR

```java
List<User> findByFirstNameOrLastName(
    String firstName,
    String lastName
);
```

Conceptually:

```sql
WHERE first_name = ?
OR last_name = ?
```

---

## 27.3 Ordering

```java
List<User> findByStatusOrderByCreatedAtDesc(
    Status status
);
```

Conceptually:

```sql
WHERE status = ?
ORDER BY created_at DESC
```

---

## 27.4 When not to use derived queries

Derived query methods are great for simple queries.

They become difficult to read when method names become huge:

```java
findByStatusAndTypeAndNameContainingAndCreatedAtBetweenAnd...
```

At that point, consider:

* `@Query`
* Specifications
* Query builders
* DTO projections
* Native SQL

---

# 28. JPQL

JPQL operates on entities and their Java properties rather than database tables directly.

Example:

```java
@Query("""
    select u
    from User u
    where u.email = :email
""")
Optional<User> findByEmail(
    @Param("email") String email
);
```

Notice:

```text
User
u.email
```

not:

```text
users
email_column
```

JPQL describes the object model.

Hibernate translates it into SQL.

---

# 29. HQL

HQL stands for Hibernate Query Language.

It is Hibernate's query language and has evolved significantly across Hibernate versions.

Conceptually:

```java
select u
from User u
where u.status = :status
```

Modern Hibernate has a richer query language than older versions.

When reading old Hibernate tutorials, always check the Hibernate version because APIs and query behavior have changed significantly over time.

---

# 30. Native SQL Queries

Sometimes you should use SQL directly.

Example:

```java
@Query(
    value = """
        SELECT *
        FROM users
        WHERE email = :email
    """,
    nativeQuery = true
)
Optional<User> findByEmailNative(
    @Param("email") String email
);
```

Native SQL is appropriate when:

* The database has specialized features.
* You need complex SQL.
* You use window functions.
* You need CTEs.
* You use database-specific operators.
* A performance-critical query is easier to express in SQL.
* You need a feature that is awkward through JPQL/HQL.

Using Hibernate does not mean you should never write SQL.

---

# 31. DTOs and Projections

Avoid loading a complete entity if the use case needs only a few fields.

Suppose your entity is:

```java
@Entity
public class User {

    private Long id;
    private String name;
    private String email;
    private String passwordHash;
    private String address;
    private Instant createdAt;
}
```

An API may only need:

```java
public record UserResponse(
    Long id,
    String name,
    String email
) {}
```

This gives a cleaner architecture.

---

## 31.1 Why DTOs are useful

DTOs:

* Define explicit API contracts.
* Prevent accidental data exposure.
* Avoid serialization of lazy relationships.
* Avoid circular references.
* Reduce unnecessary database data.
* Separate persistence models from API models.

A common architecture is:

```text
Entity
   ↓
Service
   ↓
DTO
   ↓
Controller
```

---

# 32. EntityGraph

`@EntityGraph` allows you to specify which relationships should be fetched for a particular query.

Example:

```java
@EntityGraph(attributePaths = {
    "customer",
    "items"
})
Optional<Order> findDetailedOrderById(Long id);
```

The default entity mapping can remain lazy:

```java
@ManyToOne(fetch = FetchType.LAZY)
```

but a particular use case can explicitly request the related data.

This is generally better than changing every relationship to eager loading.

---

# 33. Specifications

Specifications are useful when filters are dynamic.

Imagine a search page with:

```text
status?
name?
department?
createdAfter?
createdBefore?
minimumSalary?
```

Instead of creating dozens of repository methods, Specifications can compose predicates dynamically.

Conceptually:

```java
Specification<User> specification =
    UserSpecifications.hasStatus(status)
        .and(UserSpecifications.nameContains(name))
        .and(UserSpecifications.createdAfter(date));
```

This is useful for complex search APIs.

---

# 34. Pagination and Sorting

Avoid:

```java
repository.findAll();
```

for large tables.

Instead:

```java
Pageable pageable =
    PageRequest.of(0, 20);

Page<User> page =
    userRepository.findAll(pageable);
```

This allows:

```text
page number
page size
sorting
```

---

## 34.1 Sorting

```java
Pageable pageable =
    PageRequest.of(
        0,
        20,
        Sort.by("createdAt").descending()
    );
```

---

## 34.2 Page

`Page<T>` provides information such as:

* Current content
* Page number
* Page size
* Total number of elements
* Total number of pages

The total count can require an additional database query.

---

## 34.3 Slice

`Slice<T>` is useful when you only need to know:

> Is there another page?

It can avoid the exact total-count requirement.

For high-volume APIs, this can be preferable when the total count isn't needed.

---

# 35. Transactions

A transaction groups database operations into an atomic unit.

Typical service method:

```java
@Transactional
public void placeOrder(CreateOrderRequest request) {

    reserveInventory();

    createOrder();

    updateCustomerBalance();
}
```

If the transaction fails and rollback conditions are met, database changes can be rolled back.

---

## 35.1 Service-layer transactions

A common architecture is:

```text
Controller
    |
    v
Service @Transactional
    |
    v
Repository
```

The service layer is a good place because a business operation can involve multiple repository calls.

For example:

```java
@Transactional
public void transferMoney(
    Long sourceId,
    Long destinationId,
    BigDecimal amount
) {
    debit(sourceId, amount);
    credit(destinationId, amount);
}
```

Both operations belong to one business transaction.

---

# 36. Transaction Propagation

The most commonly encountered propagation mode is:

```text
REQUIRED
```

This means:

> If a transaction already exists, join it. Otherwise create one.

Other propagation types include:

```text
REQUIRES_NEW
SUPPORTS
MANDATORY
NOT_SUPPORTED
NEVER
NESTED
```

You should understand them conceptually, but most application code does not need complicated propagation settings.

---

## 36.1 `REQUIRES_NEW`

```java
@Transactional(propagation = Propagation.REQUIRES_NEW)
```

This suspends an existing transaction and creates another transaction.

Useful for certain independent operations, such as audit logging, but it should not be used casually because it changes transaction semantics.

---

# 37. Rollback Rules

Spring commonly rolls back transactions for unchecked exceptions.

Example:

```java
throw new RuntimeException();
```

causes rollback under normal transactional behavior.

If you need rollback for a checked exception:

```java
@Transactional(
    rollbackFor = SomeCheckedException.class
)
```

Be deliberate with exception handling.

A dangerous pattern is:

```java
@Transactional
public void doSomething() {

    try {
        repository.save(...);
    } catch (Exception e) {
        log.error("Error", e);
    }
}
```

If you swallow the exception, the transaction may not roll back as you expected.

---

# 38. Self-Invocation Problem

Spring's transaction management commonly works through proxies.

Consider:

```java
@Service
public class UserService {

    public void methodA() {
        methodB();
    }

    @Transactional
    public void methodB() {
        // ...
    }
}
```

Calling:

```java
methodB();
```

from within the same object does not normally go through the Spring proxy.

Therefore the transactional interceptor may not be invoked.

A better design is to place transactional boundaries at appropriate service boundaries rather than relying on self-invocation.

---

# 39. Optimistic Locking

Optimistic locking assumes concurrent conflicts are relatively uncommon.

Use:

```java
@Version
private Long version;
```

Example:

```java
@Entity
public class Product {

    @Id
    @GeneratedValue
    private Long id;

    @Version
    private Long version;

    private BigDecimal price;
}
```

Suppose two users load:

```text
Product version = 5
```

User A updates first:

```text
version 5 -> version 6
```

User B tries to update using version 5.

Hibernate can detect that the database row is no longer version 5 and report an optimistic locking conflict.

This helps prevent silent lost updates.

---

# 40. Pessimistic Locking

Pessimistic locking tells the database to lock rows while they are being used.

For example:

```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
Optional<Account> findById(Long id);
```

Depending on the database, this can result in behavior similar to:

```sql
SELECT ...
FROM account
WHERE id = ?
FOR UPDATE;
```

Pessimistic locking can be useful for high-contention operations.

However, locks can cause:

* Blocking
* Deadlocks
* Reduced concurrency
* Longer transaction times

Use them carefully.

---

# 41. Concurrency

Hibernate does not eliminate database concurrency problems.

You still need to understand:

* Lost updates
* Race conditions
* Transaction isolation
* Deadlocks
* Locking
* Unique constraints
* Atomic database operations

For example, this is unsafe by itself:

```java
if (!repository.existsByEmail(email)) {
    repository.save(user);
}
```

Two requests can both execute the check before either inserts.

The database should enforce:

```sql
UNIQUE(email)
```

and the application should handle the resulting constraint violation appropriately.

---

# 42. Caching

Hibernate has multiple caching concepts.

---

## 42.1 First-Level Cache

The first-level cache is associated with the persistence context.

Within a persistence context:

```java
User user1 =
    entityManager.find(User.class, 1L);

User user2 =
    entityManager.find(User.class, 1L);
```

Hibernate can return the managed entity from the persistence context rather than treating every lookup as a new database load.

This cache is essentially part of normal persistence-context behavior.

---

## 42.2 Second-Level Cache

Second-level caching is shared between persistence contexts.

Conceptually:

```text
Session A ----\
               \
                L2 Cache
               /
Session B ----/
```

It can be useful for:

* Frequently read data
* Rarely changing data
* Reference data

But caching introduces complexity around invalidation and stale data.

Do not enable caching just because it sounds faster.

---

## 42.3 Query Cache

Hibernate also has query-cache capabilities.

Again, this should be used only after understanding the workload and cache invalidation requirements.

---

# 43. Batch Processing

Suppose you need to process 1 million rows.

Doing:

```java
for (...) {
    entityManager.persist(entity);
}
```

without considering persistence-context size can consume large amounts of memory.

A common batching approach is:

```java
for (int i = 0; i < items.size(); i++) {

    entityManager.persist(items.get(i));

    if (i % 50 == 0) {
        entityManager.flush();
        entityManager.clear();
    }
}
```

The exact batch size should be tested.

---

# 44. JDBC Batching

Hibernate can group JDBC operations into batches.

Example configuration:

```yaml
spring:
  jpa:
    properties:
      hibernate:
        jdbc:
          batch_size: 50
```

Instead of making a separate database round trip for every insert, the JDBC driver can execute batches.

Batching is especially useful for:

* Bulk inserts
* Bulk updates
* Data import
* ETL jobs

But database driver behavior and identifier generation strategy can affect how effective batching is.

---

# 45. Embeddables and Value Objects

Suppose an address belongs conceptually to a user and does not have an independent identity.

You can model it as:

```java
@Embeddable
public class Address {

    private String street;

    private String city;

    private String postalCode;
}
```

Then:

```java
@Entity
public class User {

    @Embedded
    private Address address;
}
```

The database can still have columns:

```text
users
-------------------------------------------
id | name | street | city | postal_code
```

This is useful for value objects.

---

## 45.1 Entity vs Value Object

An entity has identity.

```text
User #100
```

A value object is identified by its values.

```text
Address(
    street = "Main Street",
    city = "Ahmedabad",
    postalCode = "380001"
)
```

This distinction is useful when designing domain models.

---

# 46. Enums

Prefer:

```java
@Enumerated(EnumType.STRING)
private Status status;
```

over:

```java
@Enumerated(EnumType.ORDINAL)
private Status status;
```

With `STRING`, database values look like:

```text
PENDING
PAID
CANCELLED
```

With ordinal:

```text
0
1
2
```

Ordinal values are dangerous because changing enum ordering can change the meaning of existing database rows.

---

# 47. Date and Time

Use Java's modern time API.

Common types:

```text
LocalDate
LocalTime
LocalDateTime
Instant
OffsetDateTime
ZonedDateTime
```

Choose based on meaning.

For an absolute timestamp:

```java
private Instant createdAt;
```

is often appropriate.

For a business date with no time-zone meaning:

```java
private LocalDate dueDate;
```

may be better.

Don't use `String` for dates unless you have a very specific reason.

---

# 48. Auditing

Many applications need:

```text
createdAt
updatedAt
createdBy
updatedBy
```

Spring Data JPA supports auditing.

Example:

```java
@CreatedDate
private Instant createdAt;

@LastModifiedDate
private Instant updatedAt;
```

You can also use:

```java
@CreatedBy
private String createdBy;

@LastModifiedBy
private String updatedBy;
```

Auditing needs the appropriate Spring Data auditing configuration and entity listener setup.

---

# 49. Inheritance

JPA supports several inheritance strategies.

---

## 49.1 Single Table

```java
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
```

All subclasses are stored in one table.

Example:

```text
vehicle
--------------------------------
id | type | common fields | ...
```

Advantages:

* Simple queries
* Fewer joins

Disadvantages:

* Many nullable columns
* Large table

---

## 49.2 Joined

Separate tables for base and subclasses:

```text
vehicle
car
truck
```

Advantages:

* More normalized

Disadvantages:

* Queries may require joins

---

## 49.3 Table Per Class

Each concrete class gets its own table.

This can work for some models but may make polymorphic queries expensive or complicated.

Choose inheritance based on actual database requirements rather than simply mirroring Java inheritance.

---

# 50. equals(), hashCode() and toString()

This is an important area where automatically generated code can cause Hibernate problems.

Avoid blindly using all entity fields in:

```java
equals()
hashCode()
toString()
```

Especially avoid traversing relationships.

Suppose:

```text
User
  |
  +-- Orders
       |
       +-- User
```

A `toString()` implementation that recursively traverses relationships can cause:

```text
StackOverflowError
```

It can also accidentally trigger lazy loading.

---

## 50.1 Entity equality

Entities have identity and lifecycle concerns.

A generated ID may not exist when the entity is first constructed.

Therefore, this can be problematic:

```java
@Override
public boolean equals(Object o) {
    return Objects.equals(id, other.id);
}
```

if both transient entities have:

```text
id = null
```

You need a deliberate equality strategy appropriate for your entity model.

---

# 51. Lombok and JPA

Be cautious with:

```java
@Data
```

on entities.

`@Data` generates:

* Getters
* Setters
* `equals`
* `hashCode`
* `toString`

This can cause:

* Recursive `toString()`
* Lazy loading
* Large object traversal
* Bad equality semantics
* Collection problems

Prefer explicit control over entity methods.

Using Lombok for getters/setters/constructors can still be reasonable if used carefully.

---

# 52. Database Indexes

Indexes are critical for database performance.

Suppose you frequently execute:

```sql
SELECT *
FROM users
WHERE email = ?;
```

An index on:

```text
email
```

can dramatically improve lookup performance.

JPA mapping can define indexes:

```java
@Table(
    name = "users",
    indexes = {
        @Index(
            name = "idx_users_email",
            columnList = "email"
        )
    }
)
```

However, database indexing should be based on real query patterns.

---

## 52.1 Composite indexes

Suppose you frequently execute:

```sql
WHERE status = ?
AND created_at > ?
```

A composite index may be useful:

```text
(status, created_at)
```

The correct order depends on the query patterns and database optimizer.

Always validate with execution plans.

---

# 53. Constraints

Important database constraints include:

```text
PRIMARY KEY
FOREIGN KEY
UNIQUE
NOT NULL
CHECK
```

For example:

```java
@Column(nullable = false, unique = true)
private String email;
```

But application validation is not enough.

For critical data integrity, enforce constraints in the database.

---

## 53.1 Application validation vs database constraints

Bean validation:

```java
@NotBlank
private String name;
```

helps validate incoming data.

Database constraint:

```sql
NOT NULL
```

protects the database itself.

They solve different problems.

Use both where appropriate.

---

# 54. Database Migrations

For production applications, database schema changes should be version-controlled.

Typical migration:

```text
V1__create_users.sql
V2__create_orders.sql
V3__add_user_status.sql
V4__create_order_indexes.sql
```

Migration tools include:

* Flyway
* Liquibase

The application can then evolve the schema in a controlled manner.

---

## 54.1 Why not `ddl-auto=update`?

Imagine production contains:

```text
10 million users
```

and you deploy a changed entity.

You generally don't want Hibernate making uncontrolled schema changes during application startup.

Instead:

```text
Migration
    ↓
Database schema
    ↓
Application starts
    ↓
Hibernate validates mapping
```

---

# 55. Soft Delete

Sometimes records should not be physically deleted.

Instead:

```text
deleted_at
```

or:

```text
deleted
```

is stored.

Example:

```text
id | name | deleted_at
-------------------------
1  | John | NULL
2  | Jane | 2026-08-01
```

Queries normally exclude deleted rows.

Soft delete affects:

* Indexes
* Unique constraints
* Foreign keys
* Query behavior
* Restore functionality
* Reporting
* Auditing

Therefore, don't implement it simply by adding a boolean without considering the entire data model.

---

# 56. Bulk Updates and Deletes

Spring Data can execute bulk queries.

Example:

```java
@Modifying
@Query("""
    update User u
    set u.status = :status
    where u.id in :ids
""")
int updateStatus(
    @Param("status") Status status,
    @Param("ids") Collection<Long> ids
);
```

Bulk operations are different from updating entities individually.

They execute directly against the database and can bypass normal dirty-checking behavior.

This can leave already-managed entities stale.

After bulk updates, you may need to clear or refresh the persistence context.

---

# 57. EntityManager

`EntityManager` is the core JPA API for managing entities.

Example:

```java
@PersistenceContext
private EntityManager entityManager;
```

Important methods include:

```java
persist()
find()
merge()
remove()
flush()
clear()
detach()
refresh()
```

---

## 57.1 `persist()`

Makes a new entity managed.

```java
entityManager.persist(user);
```

---

## 57.2 `find()`

Finds an entity by primary key.

```java
User user =
    entityManager.find(User.class, id);
```

---

## 57.3 `merge()`

Copies the state of a detached entity into a managed entity.

```java
User managed =
    entityManager.merge(detachedUser);
```

A common mistake is assuming:

```java
merge()
```

makes the exact object instance passed to it managed.

It returns a managed instance.

---

## 57.4 `remove()`

Marks a managed entity for deletion:

```java
entityManager.remove(user);
```

---

## 57.5 `clear()`

Detaches all managed entities from the persistence context:

```java
entityManager.clear();
```

Useful during large batch operations.

---

# 58. Open EntityManager in View

Spring Boot applications have historically enabled Open EntityManager in View for web applications.

This can allow lazy relationships to be initialized while processing a web request, even after the service method has returned.

This can hide persistence-boundary problems.

Many API-oriented applications prefer:

```yaml
spring:
  jpa:
    open-in-view: false
```

Then:

```text
Controller
    ↓
Service @Transactional
    ↓
Fetch required data
    ↓
Map to DTO
    ↓
Controller response
```

This makes data access more explicit.

---

# 59. Connection Pooling

Applications normally use a connection pool rather than creating a new database connection for every operation.

A common pool in Spring Boot applications is:

```text
HikariCP
```

Conceptually:

```text
Application
    |
    v
Connection Pool
    |
    +--- Connection 1
    +--- Connection 2
    +--- Connection 3
    +--- ...
    |
    v
Database
```

Pool size should be tuned according to:

* Database capacity
* CPU
* Query latency
* Number of application instances
* Concurrent requests
* Transaction duration

A bigger pool is not automatically faster.

---

# 60. Performance Optimization

Hibernate performance should be approached systematically.

Don't start by randomly adding annotations.

First measure.

---

## 60.1 Look at generated SQL

Ask:

```text
How many SQL statements?
How many rows?
Which joins?
Which columns?
Are indexes being used?
```

---

## 60.2 Look for N+1

This is often one of the first Hibernate problems to investigate.

---

## 60.3 Avoid unnecessary entity loading

If you only need:

```text
id
name
email
```

don't necessarily load:

```text
User
Orders
Roles
Permissions
Address
Company
Audit records
```

Use projections or targeted fetching.

---

## 60.4 Avoid huge result sets

Bad:

```java
List<User> users = repository.findAll();
```

when millions of rows exist.

Use:

* Pagination
* Streaming where appropriate
* Batch processing
* Keyset pagination
* Database-side filtering

---

## 60.5 Database indexes

Make sure frequently used query predicates and joins have appropriate indexes.

---

## 60.6 Query execution plans

For slow queries, use your database's execution-plan tools.

For PostgreSQL:

```sql
EXPLAIN ANALYZE
SELECT ...
```

The database execution plan is more important than what the Java code looks like.

---

# 61. Testing

Persistence logic should be tested.

Spring provides:

```java
@DataJpaTest
```

for JPA-focused tests.

Example:

```java
@DataJpaTest
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Test
    void shouldFindUserByEmail() {

        User user = new User(
            "John",
            "john@example.com"
        );

        userRepository.save(user);

        Optional<User> result =
            userRepository.findByEmail(
                "john@example.com"
            );

        assertThat(result).isPresent();
    }
}
```

---

## 61.1 What should repository tests verify?

Examples:

* Query correctness
* Relationships
* Constraints
* Unique indexes
* Cascade behavior
* Lazy loading
* Locking
* Custom JPQL
* Native queries
* Pagination

---

# 62. Testcontainers

For serious integration testing, Testcontainers is extremely useful.

Suppose production uses PostgreSQL.

Instead of testing only with H2:

```text
JUnit
  ↓
H2
```

you can test:

```text
JUnit
  ↓
Testcontainers
  ↓
PostgreSQL container
  ↓
Hibernate
```

This helps detect differences between your test database and production database.

Examples of differences can involve:

* SQL syntax
* Constraints
* JSON functionality
* Index behavior
* Transactions
* Locking
* PostgreSQL-specific features

---

# 63. Recommended Architecture

A practical Spring Boot application can look like:

```text
src/main/java/com/example/app/

controller/
    UserController.java
    OrderController.java

service/
    UserService.java
    OrderService.java

repository/
    UserRepository.java
    OrderRepository.java

entity/
    User.java
    Order.java
    OrderItem.java

dto/
    UserRequest.java
    UserResponse.java
    OrderResponse.java

mapper/
    UserMapper.java
    OrderMapper.java

exception/
    UserNotFoundException.java
    GlobalExceptionHandler.java

config/
    JpaConfig.java
```

The flow is:

```text
HTTP Request
     |
     v
Controller
     |
     v
Service
 @Transactional
     |
     v
Repository
     |
     v
Hibernate/JPA
     |
     v
Database
```

---

# 64. Controller Layer

The controller should primarily handle:

* HTTP request
* Request validation
* Authentication/authorization integration
* Calling service
* HTTP response

Example:

```java
@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    public UserResponse getUser(
            @PathVariable Long id) {

        return userService.getUser(id);
    }
}
```

Don't put complicated database logic directly into controllers.

---

# 65. Service Layer

The service should represent business operations.

Example:

```java
@Service
public class UserService {

    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public UserResponse getUser(Long id) {

        User user = userRepository
            .findById(id)
            .orElseThrow(UserNotFoundException::new);

        return new UserResponse(
            user.getId(),
            user.getName(),
            user.getEmail()
        );
    }
}
```

The service controls the transaction boundary and business logic.

---

# 66. Repository Layer

Repositories should primarily handle persistence operations.

Example:

```java
public interface UserRepository
        extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    List<User> findByStatus(Status status);
}
```

Avoid putting complicated business rules into repository classes.

---

# 67. Entity Design Best Practices

A good entity should generally:

* Represent a meaningful domain concept.
* Have a stable identity.
* Avoid unnecessary public constructors.
* Avoid exposing internal collections directly.
* Keep relationship management consistent.
* Avoid huge object graphs.
* Avoid business logic that depends heavily on persistence internals.

Example collection management:

```java
public void addItem(OrderItem item) {
    items.add(item);
    item.setOrder(this);
}
```

This is better than allowing every caller to manipulate both sides independently.

---

# 68. Entity vs DTO

A useful rule:

```text
Entity = Persistence/domain representation

DTO = API/data-transfer representation
```

Don't expose sensitive fields such as:

```text
passwordHash
internal flags
security information
internal IDs
audit information
```

unless there is an explicit reason.

DTOs also prevent your public API contract from becoming tightly coupled to your database schema.

---

# 69. External Systems and Transactions

A database transaction cannot automatically roll back an external operation.

For example:

```text
Database transaction
      |
      +--- save order
      |
      +--- charge payment service
      |
      +--- publish Kafka message
```

If payment succeeds but the database transaction fails, the database cannot simply tell the payment service:

```text
ROLLBACK
```

Distributed systems require different patterns.

Important concepts include:

* Idempotency
* Outbox pattern
* Saga pattern
* Event-driven architecture
* Retry
* Compensation

---

# 70. Outbox Pattern

A common approach:

```text
Database Transaction
       |
       +--- Order
       |
       +--- Outbox Event
       |
       v
     COMMIT
       |
       v
Outbox Publisher
       |
       v
Kafka / Message Broker
```

The order and event are committed atomically in the same database transaction.

A separate process publishes the event.

This avoids many consistency problems.

---

# 71. Pagination at Scale

Offset pagination:

```sql
SELECT *
FROM users
ORDER BY id
LIMIT 20
OFFSET 100000;
```

can become expensive for very large offsets.

Keyset pagination can be better:

```sql
SELECT *
FROM users
WHERE id > ?
ORDER BY id
LIMIT 20;
```

The application sends the last seen ID as a cursor.

This approach can scale better for large datasets.

---

# 72. Composite Keys

JPA supports composite IDs.

One approach:

```java
@Embeddable
public class EnrollmentId {

    private Long studentId;

    private Long courseId;
}
```

Then:

```java
@EmbeddedId
private EnrollmentId id;
```

Another approach is:

```java
@IdClass
```

Composite keys are valid, but they can make application code and relationships more complicated.

If the domain allows it, a surrogate key can sometimes simplify the model.

---

# 73. UUID IDs

UUIDs can be useful when:

* IDs need to be globally unique.
* Multiple systems generate IDs.
* You don't want sequential IDs exposed externally.
* Distributed creation is important.

But consider:

* Storage size
* Index size
* Ordering
* Database UUID support
* Performance

For public APIs, another common approach is to keep an internal numeric ID and expose a separate public identifier.

---

# 74. `@MappedSuperclass`

A common pattern:

```java
@MappedSuperclass
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    protected Long id;

    protected Instant createdAt;

    protected Instant updatedAt;
}
```

Then:

```java
@Entity
public class User extends BaseEntity {
    // ...
}
```

The base class provides mapped fields to subclasses.

It does not necessarily represent its own database table.

---

# 75. Entity Listeners

Entity listeners can be useful for lifecycle events.

Examples include:

```text
@PrePersist
@PreUpdate
@PostPersist
@PostUpdate
@PostRemove
```

Example:

```java
@PrePersist
public void beforeInsert() {
    createdAt = Instant.now();
}
```

However, don't put complex business workflows into entity callbacks.

For substantial business logic, a service/domain-event approach is usually easier to understand and test.

---

# 76. Hibernate-Specific Features

Hibernate provides features beyond standard JPA.

Examples include:

* Advanced HQL
* Filters
* Batch fetching
* Hibernate-specific annotations
* Custom types
* Advanced caching
* Hibernate event system
* SQL restrictions
* Database-specific capabilities

Use Hibernate-specific features when they provide real value.

But remember that they can increase vendor coupling.

---

# 77. Version Compatibility

Always know the versions you are using:

```text
Java
Spring Boot
Spring Framework
Spring Data
Hibernate
Jakarta Persistence
Database
JDBC Driver
```

Do not blindly copy code from a five-year-old tutorial.

Older code may use:

```java
javax.persistence.*
```

while modern applications use:

```java
jakarta.persistence.*
```

Hibernate 6+ also introduced substantial changes compared with older Hibernate generations.

When reading examples online, verify:

```text
Spring Boot version
Hibernate version
JPA/Jakarta version
Database
```

before adopting the code.

---

# 78. Logging and SQL Debugging

During development, seeing generated SQL is extremely useful.

For example:

```yaml
spring:
  jpa:
    properties:
      hibernate:
        format_sql: true
```

You can configure appropriate logging categories depending on the Hibernate/Spring version.

However, be careful in production.

SQL and parameter logging can expose:

* Personal information
* Business data
* Credentials
* Tokens
* Sensitive values

Never enable verbose SQL/parameter logging in production without understanding what data can appear in logs.

---

# 79. How to Debug a Hibernate Problem

When something is wrong, use this sequence.

### Step 1 — Look at the generated SQL

Ask:

```text
What SQL did Hibernate actually execute?
```

### Step 2 — Count queries

Ask:

```text
Was there one query or 100?
```

### Step 3 — Check relationships

Ask:

```text
Is this LAZY?
Is it EAGER?
Is there a JOIN FETCH?
```

### Step 4 — Check transaction boundary

Ask:

```text
Is the entity still managed?
Is there an active transaction?
```

### Step 5 — Check database constraints

Look for:

```text
UNIQUE
FOREIGN KEY
NOT NULL
CHECK
```

### Step 6 — Check indexes

Ask:

```text
Does the database have an appropriate index?
```

### Step 7 — Check execution plan

Use the database's tools:

```sql
EXPLAIN ANALYZE ...
```

This approach is much better than randomly changing Hibernate annotations.

---

# 80. Common Anti-Patterns

## 80.1 Making everything EAGER

Bad approach:

```java
@ManyToOne(fetch = FetchType.EAGER)
@OneToMany(fetch = FetchType.EAGER)
```

everywhere.

Why?

You can accidentally load huge graphs.

---

## 80.2 Using `ddl-auto=update` in production

Schema changes should generally be controlled using migrations.

---

## 80.3 Returning entities directly from REST

This can cause:

* Lazy loading
* Circular JSON
* Data exposure
* Tight coupling
* Unexpected queries

Use DTOs for most APIs.

---

## 80.4 Using `@Data` on entities

This can create bad:

```text
equals
hashCode
toString
```

behavior.

---

## 80.5 Ignoring N+1

A local test with 10 rows may look fine.

Production with 100,000 rows can become disastrous.

---

## 80.6 Calling `findAll()` everywhere

Always consider:

```text
How many records?
Which columns?
Which relationships?
Do I need pagination?
```

---

## 80.7 Blindly using CascadeType.ALL

Cascade should represent ownership.

---

## 80.8 Using Many-to-Many everywhere

If the relationship has attributes, model the join table as an entity.

---

## 80.9 Ignoring database indexes

Hibernate can generate the correct SQL while the database still executes it slowly because an index is missing.

---

## 80.10 Long transactions

Avoid:

```text
BEGIN
    DB operation
    HTTP call
    wait
    another HTTP call
    DB operation
COMMIT
```

Long transactions consume resources and can hold locks.

---

# 81. Best Practices

## Entity Mapping

* Use `jakarta.persistence`.
* Define explicit mappings when database naming matters.
* Use appropriate identifier strategies.
* Avoid unnecessary bidirectional relationships.
* Keep collections initialized.
* Prefer LAZY relationships.
* Keep entity equality deliberate.

---

## Relationships

* Understand the owning side.
* Use `mappedBy` correctly.
* Keep both sides synchronized.
* Use cascading only when ownership exists.
* Use orphan removal only for true child entities.
* Consider explicit join entities instead of complex many-to-many relationships.

---

## Transactions

* Put transaction boundaries around business operations.
* Keep transactions reasonably short.
* Use `readOnly = true` for appropriate read-only service methods.
* Understand rollback behavior.
* Understand propagation before using advanced propagation settings.
* Avoid external network operations inside long database transactions.

---

## Queries

* Understand the SQL Hibernate generates.
* Detect N+1 problems.
* Use projections when appropriate.
* Use fetch joins carefully.
* Use EntityGraph for targeted fetching.
* Use pagination.
* Consider keyset pagination for large datasets.
* Use native SQL when SQL is genuinely the right tool.

---

## Database

* Use proper constraints.
* Add indexes based on query patterns.
* Use migration tools.
* Use the production database engine in important integration tests.
* Review query execution plans.
* Tune connection pools based on measurements.

---

## API Design

* Use DTOs.
* Don't expose entities by default.
* Don't expose password hashes or internal fields.
* Avoid returning massive object graphs.
* Keep API contracts independent from persistence models.

---

# 82. Interview Questions

These are the questions you should be able to answer clearly.

## Fundamentals

1. What is Hibernate?
2. What is JPA?
3. What is the difference between JPA and Hibernate?
4. What is Spring Data JPA?
5. What does `spring-boot-starter-data-jpa` provide?
6. What is ORM?
7. What is an entity?
8. What is a persistence context?

---

## Entity Lifecycle

9. What are the entity lifecycle states?
10. What is a transient entity?
11. What is a managed entity?
12. What is a detached entity?
13. What is a removed entity?
14. What does `persist()` do?
15. What does `merge()` do?
16. What is the difference between `persist()` and `merge()`?
17. What does `flush()` do?

---

## Hibernate Internals

18. What is dirty checking?
19. What is the first-level cache?
20. What is the second-level cache?
21. What is lazy loading?
22. How does Hibernate create lazy proxies?
23. What causes `LazyInitializationException`?
24. What is Open EntityManager in View?

---

## Relationships

25. What is `@ManyToOne`?
26. What is `@OneToMany`?
27. What is `@OneToOne`?
28. What is `@ManyToMany`?
29. What is the owning side?
30. What does `mappedBy` mean?
31. What does `@JoinColumn` do?
32. What does `@JoinTable` do?
33. What is cascade?
34. What is orphan removal?
35. Why can `@ManyToMany` become problematic?

---

## Fetching and Performance

36. What is the difference between LAZY and EAGER?
37. Why is LAZY generally preferred?
38. What is the N+1 problem?
39. How can you solve N+1?
40. What is `JOIN FETCH`?
41. What is an EntityGraph?
42. What is batch fetching?
43. What is JDBC batching?
44. How would you debug a slow Hibernate query?

---

## Spring Data JPA

45. What is `JpaRepository`?
46. What are derived query methods?
47. What is JPQL?
48. What is HQL?
49. JPQL vs native SQL?
50. What is `@Query`?
51. What is `@Modifying`?
52. What are projections?
53. What are Specifications?
54. What is `Page`?
55. What is `Slice`?

---

## Transactions

56. What does `@Transactional` do?
57. Where should transactions normally be placed?
58. What is transaction propagation?
59. What is `REQUIRED`?
60. What is `REQUIRES_NEW`?
61. What causes transaction rollback?
62. What is the self-invocation problem?
63. What is transaction isolation?
64. What is a deadlock?

---

## Locking

65. What is optimistic locking?
66. What does `@Version` do?
67. What is pessimistic locking?
68. When would you use pessimistic locking?
69. Optimistic vs pessimistic locking?

---

## Database

70. Why are indexes important?
71. How do composite indexes work?
72. Why should database constraints be used?
73. Why shouldn't `ddl-auto=update` normally be used in production?
74. What is Flyway?
75. What is Liquibase?
76. Why use Testcontainers?

---

# 83. Quick Revision Cheat Sheet

## Core architecture

```text
Spring Boot
    ↓
Spring Data JPA
    ↓
JPA
    ↓
Hibernate
    ↓
JDBC
    ↓
Database
```

---

## Entity

```java
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;
}
```

---

## Many-to-One

```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "department_id")
private Department department;
```

---

## One-to-Many

```java
@OneToMany(
    mappedBy = "department",
    fetch = FetchType.LAZY
)
private List<Employee> employees =
    new ArrayList<>();
```

---

## Bidirectional helper

```java
public void addEmployee(Employee employee) {
    employees.add(employee);
    employee.setDepartment(this);
}
```

---

## Repository

```java
public interface UserRepository
        extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
}
```

---

## Custom query

```java
@Query("""
    select u
    from User u
    where u.status = :status
""")
List<User> findByStatus(
    @Param("status") Status status
);
```

---

## DTO

```java
public record UserResponse(
    Long id,
    String name,
    String email
) {}
```

---

## Transaction

```java
@Transactional
public void updateUser(Long id, String name) {

    User user = repository
        .findById(id)
        .orElseThrow();

    user.setName(name);
}
```

Dirty checking can generate the update.

---

## Read-only transaction

```java
@Transactional(readOnly = true)
public UserResponse getUser(Long id) {
    // ...
}
```

---

## Optimistic locking

```java
@Version
private Long version;
```

---

## EntityGraph

```java
@EntityGraph(attributePaths = {
    "customer",
    "items"
})
Optional<Order> findDetailedOrderById(Long id);
```

---

## Pagination

```java
Pageable pageable =
    PageRequest.of(
        page,
        size,
        Sort.by("createdAt").descending()
    );

Page<User> result =
    repository.findAll(pageable);
```

---

## Production configuration

A reasonable starting point:

```yaml
spring:
  jpa:
    open-in-view: false

    hibernate:
      ddl-auto: validate

  datasource:
    hikari:
      maximum-pool-size: 20
```

The actual pool size should be determined through measurement and database capacity rather than copying `20` blindly.

---

# 84. Most Important Mental Models

## Mental Model 1 — Hibernate is an ORM

```text
Java Objects
     ↕
Hibernate
     ↕
Relational Database
```

Hibernate translates between object-oriented and relational representations.

---

## Mental Model 2 — Persistence Context Tracks Entities

```text
Database
    ↕
Persistence Context
    ↕
Managed Entities
```

If an entity is managed, Hibernate can detect changes.

---

## Mental Model 3 — Dirty Checking

```text
Load
  ↓
Managed entity
  ↓
Modify Java object
  ↓
Hibernate detects change
  ↓
Flush
  ↓
UPDATE SQL
```

---

## Mental Model 4 — Lazy Loading

```text
Order
 |
 +-- customer (not loaded initially)
 |
 +-- items (not loaded initially)

Access customer
       ↓
Hibernate loads customer
```

This is convenient, but can cause N+1 problems if used without understanding query behavior.

---

## Mental Model 5 — Transactions

```text
BEGIN
  |
  +--- operation 1
  |
  +--- operation 2
  |
  +--- operation 3
  |
COMMIT
```

If failure occurs and rollback applies:

```text
BEGIN
  |
  +--- operation 1
  |
  +--- operation 2
  |
  X failure
  |
ROLLBACK
```

---

## Mental Model 6 — Fetch What the Use Case Needs

Don't think:

```text
"I need a User entity."
```

Think:

```text
"What information does this particular use case need?"
```

For one use case:

```text
User only
```

For another:

```text
User + Orders
```

For another:

```text
User ID + Name + Department Name
```

This mindset leads to better query design.

---

# 85. Practical Learning Path

If you are learning Hibernate from scratch, don't try to memorize all annotations.

Follow this sequence.

## Phase 1 — SQL

Learn:

```text
SELECT
JOIN
INSERT
UPDATE
DELETE
GROUP BY
INDEXES
CONSTRAINTS
TRANSACTIONS
```

---

## Phase 2 — JPA Basics

Learn:

```text
@Entity
@Id
@Column
@GeneratedValue

EntityManager
Persistence Context
Entity Lifecycle
```

Build a simple:

```text
User CRUD
```

application.

---

## Phase 3 — Relationships

Build:

```text
Department
    |
    +--- Employee
```

Learn:

```text
@ManyToOne
@OneToMany
mappedBy
@JoinColumn
LAZY
Cascade
orphanRemoval
```

---

## Phase 4 — Queries

Learn:

```text
Derived queries
JPQL
HQL
Native SQL
DTO projections
EntityGraph
Specifications
```

Build a search API.

---

## Phase 5 — Transactions

Build something like:

```text
Bank Transfer
```

and understand:

```text
@Transactional
rollback
isolation
locking
```

---

## Phase 6 — Performance

Intentionally create:

```text
N+1 problem
```

Then solve it using:

```text
JOIN FETCH
EntityGraph
DTO projection
batch fetching
```

Also learn to inspect SQL.

---

## Phase 7 — Production

Learn:

```text
Flyway/Liquibase
Testcontainers
connection pooling
indexes
query plans
logging
monitoring
optimistic locking
batch processing
```

At this point, you'll understand Hibernate as an actual production technology rather than just a collection of annotations.

---

# 86. Final Rules to Remember

If you remember only the following rules, you will avoid many common Hibernate problems:

1. **Learn SQL alongside Hibernate.**
2. **Understand the persistence context.**
3. **Understand entity lifecycle states.**
4. **Know what dirty checking does.**
5. **Don't assume `save()` means immediate SQL execution.**
6. **Prefer LAZY relationships.**
7. **Don't use EAGER loading to hide lazy-loading problems.**
8. **Always be aware of N+1 queries.**
9. **Use JOIN FETCH, EntityGraph, or projections intentionally.**
10. **Use DTOs for API boundaries.**
11. **Keep transactions at meaningful service/business boundaries.**
12. **Keep transactions reasonably short.**
13. **Understand optimistic and pessimistic locking.**
14. **Use database constraints for data integrity.**
15. **Use indexes based on real query patterns.**
16. **Don't use `ddl-auto=update` as your production migration strategy.**
17. **Use Flyway or Liquibase for controlled schema evolution.**
18. **Don't blindly use `CascadeType.ALL`.**
19. **Be careful with `@ManyToMany`.**
20. **Be deliberate about `equals()`, `hashCode()`, and `toString()` in entities.**
21. **Don't blindly put Lombok `@Data` on entities.**
22. **Don't load more data than the use case needs.**
23. **Use pagination for large result sets.**
24. **Consider keyset pagination at very large scale.**
25. **Use batching for large data operations.**
26. **Test persistence behavior against the real database when it matters.**
27. **Use Testcontainers for realistic integration tests.**
28. **Measure before optimizing.**
29. **When debugging Hibernate, inspect the SQL first.**
30. **Remember that Hibernate is an ORM, not a replacement for database knowledge.**

---

# 87. One-Page Summary

```text
                         SPRING BOOT
                              |
                              v
                      SPRING DATA JPA
                              |
                              v
                    JPA / JAKARTA API
                              |
                              v
                         HIBERNATE
                              |
                              v
                            JDBC
                              |
                              v
                         DATABASE
```

### Entity

```java
@Entity
@Table(name = "users")
class User {

    @Id
    @GeneratedValue
    private Long id;
}
```

### Relationship

```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "department_id")
private Department department;
```

### Reverse side

```java
@OneToMany(mappedBy = "department")
private List<Employee> employees;
```

### Persistence

```text
Transient
   ↓
persist
   ↓
Managed
   ↓
dirty checking
   ↓
flush
   ↓
SQL
   ↓
commit
```

### Query options

```text
Derived Query
     |
     +-- Simple query

JPQL/HQL
     |
     +-- Object-oriented query

Native SQL
     |
     +-- Database-specific/complex query

Projection/DTO
     |
     +-- Only required data

EntityGraph / JOIN FETCH
     |
     +-- Explicit relationship fetching

Specification
     |
     +-- Dynamic filtering
```

### Performance problems

```text
N+1
Large result sets
Missing indexes
Too many joins
Unnecessary eager loading
Long transactions
Excessive flushes
Large persistence contexts
Too many database round trips
```

### Production architecture

```text
              REST API
                 |
                 v
             Controller
                 |
                 v
              Service
          @Transactional
                 |
                 v
             Repository
                 |
                 v
             Hibernate
                 |
                 v
             PostgreSQL
```

### Production principles

```text
LAZY by default
+
Explicit fetching
+
DTOs
+
Service transactions
+
Database constraints
+
Proper indexes
+
Migration tool
+
Integration tests
+
SQL monitoring
+
Measured optimization
```

---

# 88. Official Documentation

When learning or troubleshooting, prefer the documentation matching your actual versions.

* Spring Boot documentation: https://docs.spring.io/spring-boot/
* Spring Data JPA documentation: https://docs.spring.io/spring-data/jpa/reference/
* Hibernate documentation: https://docs.hibernate.org/orm/
* Jakarta Persistence specification: https://jakarta.ee/specifications/persistence/
* Flyway documentation: https://documentation.red-gate.com/flyway
* Liquibase documentation: https://docs.liquibase.com/
* Testcontainers documentation: https://java.testcontainers.org/

Always check the version of Spring Boot/Hibernate before applying examples from blogs, Stack Overflow, or older tutorials.

---

# 89. Final Mental Model

The single most useful way to think about Spring Boot + Hibernate is:

```text
                BUSINESS USE CASE
                       |
                       v
                   SERVICE
                @Transactional
                       |
                       v
                   REPOSITORY
                       |
                       v
              PERSISTENCE CONTEXT
                       |
              +--------+--------+
              |                 |
              v                 v
         Managed Entity      Hibernate
                                |
                                v
                             SQL
                                |
                                v
                           Database
```

When something goes wrong, ask:

```text
1. What entity am I working with?
2. Is it managed?
3. What transaction am I in?
4. What SQL is Hibernate generating?
5. How many SQL queries are being executed?
6. Are relationships LAZY or EAGER?
7. Am I accidentally triggering N+1?
8. Am I loading more data than required?
9. Are the required database indexes present?
10. Is the database enforcing the required constraints?
11. Is concurrency involved?
12. Is this actually an ORM problem, or is it a database/SQL problem?
```

If you can answer those questions consistently, you are moving from simply **using Hibernate** to actually **understanding Hibernate**.
