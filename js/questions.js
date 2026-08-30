// SQL Quest Practice Question Bank
const PRACTICE_QUESTIONS = {
  basics: [
    {
      id: 'p1',
      question: "Retrieve the names of all employees who earn a salary of exactly 60000.",
      hint: "Use SELECT name FROM employees WHERE salary = 60000;",
      solution: "SELECT name FROM employees WHERE salary = 60000",
      requiredKeywords: ["select", "name", "from", "employees", "where", "salary", "="],
      database: "company",
      tables: ["employees"]
    },
    {
      id: 'p2',
      question: "Find all departments located in location 1700.",
      hint: "Filter where location_id = 1700 in the departments table.",
      solution: "SELECT * FROM departments WHERE location_id = 1700",
      requiredKeywords: ["select", "from", "departments", "where", "location_id", "=", "1700"],
      database: "company",
      tables: ["departments"]
    },
    {
      id: 'p3',
      question: "Retrieve all unique jobs in the company using the jobs table.",
      hint: "Use: SELECT DISTINCT job_title FROM jobs;",
      solution: "SELECT DISTINCT job_title FROM jobs",
      requiredKeywords: ["select", "distinct", "job_title", "from", "jobs"],
      database: "company",
      tables: ["jobs"]
    },
    {
      id: 'p4',
      question: "Find all employees whose salary is between 50000 and 80000, inclusive.",
      hint: "Use BETWEEN for range matching.",
      solution: "SELECT * FROM employees WHERE salary BETWEEN 50000 AND 80000",
      requiredKeywords: ["select", "from", "employees", "where", "salary", "between", "50000", "and", "80000"],
      database: "company",
      tables: ["employees"]
    }
  ],
  foundations: [
    {
      id: 'p5',
      question: "Retrieve all employees whose name begins with the letter 'J'.",
      hint: "Use: WHERE name LIKE 'J%'",
      solution: "SELECT * FROM employees WHERE name LIKE 'J%'",
      requiredKeywords: ["select", "from", "employees", "where", "name", "like", "j%"],
      database: "company",
      tables: ["employees"]
    },
    {
      id: 'p6',
      question: "Find all departments that do NOT have a manager (manager_id is null).",
      hint: "Use: WHERE manager_id IS NULL",
      solution: "SELECT * FROM departments WHERE manager_id IS NULL",
      requiredKeywords: ["select", "from", "departments", "where", "manager_id", "is", "null"],
      database: "company",
      tables: ["departments"]
    },
    {
      id: 'p7',
      question: "List all products in the e-commerce database sorted by price from cheapest to most expensive.",
      hint: "Use ORDER BY price ASC;",
      solution: "SELECT * FROM products ORDER BY price ASC",
      requiredKeywords: ["select", "from", "products", "order", "by", "price", "asc"],
      database: "ecommerce",
      tables: ["products"]
    },
    {
      id: 'p8',
      question: "Find the average price of all products in the category 'Electronics'.",
      hint: "Use AVG(price) and filter by category.",
      solution: "SELECT AVG(price) FROM products WHERE category = 'Electronics'",
      requiredKeywords: ["select", "avg(price)", "from", "products", "where", "category", "=", "'electronics'"],
      database: "ecommerce",
      tables: ["products"]
    }
  ],
  joins: [
    {
      id: 'p9',
      question: "Find all products ordered in order 5001. List product_name and the ordered quantity.",
      hint: "Join order_items and products on product_id, then filter by order_id = 5001.",
      solution: "SELECT p.product_name, oi.quantity FROM order_items oi INNER JOIN products p ON oi.product_id = p.product_id WHERE oi.order_id = 5001",
      requiredKeywords: ["select", "join", "on", "order_items", "products", "order_id", "5001"],
      database: "ecommerce",
      tables: ["products", "order_items"]
    },
    {
      id: 'p10',
      question: "List all students and the names of courses they are enrolled in. Return student name and course_name.",
      hint: "Join students, enrollments, and courses.",
      solution: "SELECT s.name, c.course_name FROM students s INNER JOIN enrollments e ON s.student_id = e.student_id INNER JOIN courses c ON e.course_id = c.course_id",
      requiredKeywords: ["select", "inner", "join", "students", "enrollments", "courses", "student_id", "course_id"],
      database: "college",
      tables: ["students", "enrollments", "courses"]
    }
  ],
  subqueries: [
    {
      id: 'p11',
      question: "Find products whose price is strictly higher than the average price of all products.",
      hint: "Use a subquery in the WHERE clause: WHERE price > (SELECT AVG(price) FROM products)",
      solution: "SELECT product_name, price FROM products WHERE price > (SELECT AVG(price) FROM products)",
      requiredKeywords: ["select", "from", "products", "where", "price", ">", "avg(price)"],
      database: "ecommerce",
      tables: ["products"]
    },
    {
      id: 'p12',
      question: "Retrieve the details of orders that have payments made by 'Credit Card'. Use a subquery with IN or EXISTS.",
      hint: "Use: WHERE order_id IN (SELECT order_id FROM payments WHERE payment_method = 'Credit Card')",
      solution: "SELECT * FROM orders WHERE order_id IN (SELECT order_id FROM payments WHERE payment_method = 'Credit Card')",
      requiredKeywords: ["select", "from", "orders", "where", "order_id", "in", "payments", "payment_method"],
      database: "ecommerce",
      tables: ["orders", "payments"]
    }
  ],
  analytics: [
    {
      id: 'p13',
      question: "Rank students in the students table by age from youngest to oldest. Name the rank column 'age_rank'.",
      hint: "Use DENSE_RANK() OVER (ORDER BY age ASC) AS age_rank.",
      solution: "SELECT name, age, DENSE_RANK() OVER (ORDER BY age ASC) AS age_rank FROM students",
      requiredKeywords: ["select", "dense_rank()", "over", "order", "by", "age", "asc", "from", "students"],
      database: "college",
      tables: ["students"]
    }
  ]
};

// 30 Final Exam questions (5 Easy, 10 Medium, 10 Hard, 5 Expert)
const EXAM_QUESTIONS = [
  // --- EASY (5) ---
  { id: 'e1', difficulty: 'easy', topic: 'basics', question: "Select all columns from the products table.", solution: "SELECT * FROM products", requiredKeywords: ["select", "*", "from", "products"], database: "ecommerce" },
  { id: 'e2', difficulty: 'easy', topic: 'basics', question: "Select first_name and email of all customers.", solution: "SELECT first_name, email FROM customers", requiredKeywords: ["select", "first_name", "email", "from", "customers"], database: "ecommerce" },
  { id: 'e3', difficulty: 'easy', topic: 'basics', question: "Find all products with a price greater than 500.", solution: "SELECT * FROM products WHERE price > 500", requiredKeywords: ["select", "from", "products", "where", "price", ">", "500"], database: "ecommerce" },
  { id: 'e4', difficulty: 'easy', topic: 'basics', question: "Find patients in the patients table who are older than 40.", solution: "SELECT * FROM patients WHERE age > 40", requiredKeywords: ["select", "from", "patients", "where", "age", ">", "40"], database: "hospital" },
  { id: 'e5', difficulty: 'easy', topic: 'basics', question: "Count the total number of students in the college database.", solution: "SELECT COUNT(*) FROM students", requiredKeywords: ["select", "count(*)", "from", "students"], database: "college" },

  // --- MEDIUM (10) ---
  { id: 'e6', difficulty: 'medium', topic: 'foundations', question: "Find all employees hired after '2020-01-01'.", solution: "SELECT * FROM employees WHERE hire_date > '2020-01-01'", requiredKeywords: ["select", "from", "employees", "where", "hire_date", ">"], database: "company" },
  { id: 'e7', difficulty: 'medium', topic: 'foundations', question: "Find unique departments in the employees table that are not null.", solution: "SELECT DISTINCT department_id FROM employees WHERE department_id IS NOT NULL", requiredKeywords: ["select", "distinct", "department_id", "from", "where", "is", "not", "null"], database: "company" },
  { id: 'e8', difficulty: 'medium', topic: 'foundations', question: "Select employee names in lowercase from the employees table.", solution: "SELECT LOWER(name) FROM employees", requiredKeywords: ["select", "lower(name)", "from", "employees"], database: "company" },
  { id: 'e9', difficulty: 'medium', topic: 'foundations', question: "Find the average age of all patients in the hospital database.", solution: "SELECT AVG(age) FROM patients", requiredKeywords: ["select", "avg(age)", "from", "patients"], database: "hospital" },
  { id: 'e10', difficulty: 'medium', topic: 'foundations', question: "Retrieve the top 2 cheapest products from the products table.", solution: "SELECT * FROM products ORDER BY price ASC FETCH FIRST 2 ROWS ONLY", requiredKeywords: ["select", "from", "products", "order", "by", "price", "asc", "fetch", "first", "2", "rows", "only"], database: "ecommerce" },
  { id: 'e11', difficulty: 'medium', topic: 'foundations', question: "Calculate the average salary per department, grouped by department_id.", solution: "SELECT department_id, AVG(salary) FROM employees GROUP BY department_id", requiredKeywords: ["select", "department_id", "avg(salary)", "from", "group", "by"], database: "company" },
  { id: 'e12', difficulty: 'medium', topic: 'foundations', question: "Find departments where the maximum employee salary is greater than 100000.", solution: "SELECT department_id, MAX(salary) FROM employees GROUP BY department_id HAVING MAX(salary) > 100000", requiredKeywords: ["select", "department_id", "max(salary)", "from", "group", "by", "having", "100000"], database: "company" },
  { id: 'e13', difficulty: 'medium', topic: 'foundations', question: "Display employee names and a status column: 'Senior' if hire_date < '2020-01-01', else 'Junior'.", solution: "SELECT name, CASE WHEN hire_date < '2020-01-01' THEN 'Senior' ELSE 'Junior' END AS status FROM employees", requiredKeywords: ["select", "case", "when", "hire_date", "then", "else", "end", "as", "status", "from", "employees"], database: "company" },
  { id: 'e14', difficulty: 'medium', topic: 'foundations', question: "Find products with names containing 'chair' (case-insensitive).", solution: "SELECT * FROM products WHERE product_name LIKE '%chair%'", requiredKeywords: ["select", "from", "products", "where", "product_name", "like", "%chair%"], database: "ecommerce" },
  { id: 'e15', difficulty: 'medium', topic: 'foundations', question: "Find the age remainder (modulo 5) for all students in the college database.", solution: "SELECT name, MOD(age, 5) AS rem FROM students", requiredKeywords: ["select", "mod(age,", "5)", "as", "rem", "from", "students"], database: "college" },

  // --- HARD (10) ---
  { id: 'e16', difficulty: 'hard', topic: 'joins', question: "Retrieve patient name and their matching bill status. Join patients and bills.", solution: "SELECT p.name, b.status FROM patients p INNER JOIN bills b ON p.patient_id = b.patient_id", requiredKeywords: ["select", "inner", "join", "on", "patients", "bills", "patient_id"], database: "hospital" },
  { id: 'e17', difficulty: 'hard', topic: 'joins', question: "Find products and their total order quantities. Do a left join on order_items.", solution: "SELECT p.product_name, SUM(oi.quantity) AS total_qty FROM products p LEFT JOIN order_items oi ON p.product_id = oi.product_id GROUP BY p.product_name", requiredKeywords: ["select", "left", "join", "on", "products", "order_items", "product_id", "group", "by"], database: "ecommerce" },
  { id: 'e18', difficulty: 'hard', topic: 'joins', question: "Retrieve student name, course name, and teacher name for all college enrollments. Join students, enrollments, courses, and teachers (using course department).", solution: "SELECT s.name AS student, c.course_name, t.name AS teacher FROM students s INNER JOIN enrollments e ON s.student_id = e.student_id INNER JOIN courses c ON e.course_id = c.course_id INNER JOIN teachers t ON c.department = t.department", requiredKeywords: ["select", "join", "students", "enrollments", "courses", "teachers"], database: "college" },
  { id: 'e19', difficulty: 'hard', topic: 'subqueries', question: "Find students who are enrolled in the course 'CS101'. Use a subquery.", solution: "SELECT * FROM students WHERE student_id IN (SELECT student_id FROM enrollments WHERE course_id = 'CS101')", requiredKeywords: ["select", "from", "students", "where", "student_id", "in", "enrollments", "course_id", "cs101"], database: "college" },
  { id: 'e20', difficulty: 'hard', topic: 'subqueries', question: "Find employees earning more than the average salary of department 90.", solution: "SELECT * FROM employees WHERE salary > (SELECT AVG(salary) FROM employees WHERE department_id = 90)", requiredKeywords: ["select", "from", "employees", "where", "salary", ">", "avg(salary)", "department_id", "90"], database: "company" },
  { id: 'e21', difficulty: 'hard', topic: 'joins', question: "Find all active manager names (matching employee names who are managers of departments). Use an inner join.", solution: "SELECT e.name FROM employees e INNER JOIN departments d ON e.id = d.manager_id", requiredKeywords: ["select", "inner", "join", "on", "employees", "departments", "manager_id"], database: "company" },
  { id: 'e22', difficulty: 'hard', topic: 'subqueries', question: "Find customers who have placed at least one order. Use EXISTS.", solution: "SELECT c.first_name FROM customers c WHERE EXISTS (SELECT 1 FROM orders o WHERE o.customer_id = c.customer_id)", requiredKeywords: ["select", "from", "customers", "where", "exists", "orders", "customer_id"], database: "ecommerce" },
  { id: 'e23', difficulty: 'hard', topic: 'joins', question: "Get a unified list of all manager_ids from both employees and departments. Remove duplicates with UNION.", solution: "SELECT manager_id FROM employees UNION SELECT manager_id FROM departments", requiredKeywords: ["select", "manager_id", "from", "union", "employees", "departments"], database: "company" },
  { id: 'e24', difficulty: 'hard', topic: 'joins', question: "Find manager IDs in employees that do NOT manage any department using MINUS.", solution: "SELECT manager_id FROM employees MINUS SELECT manager_id FROM departments", requiredKeywords: ["select", "manager_id", "from", "minus", "employees", "departments"], database: "company" },
  { id: 'e25', difficulty: 'hard', topic: 'joins', question: "Find departments that have no employees assigned. Use a left join.", solution: "SELECT d.department_name FROM departments d LEFT JOIN employees e ON d.department_id = e.department_id WHERE e.id IS NULL", requiredKeywords: ["select", "left", "join", "on", "departments", "employees", "where", "is", "null"], database: "company" },

  // --- EXPERT (5) ---
  { id: 'e26', difficulty: 'expert', topic: 'subqueries', question: "Use a CTE named 'avg_sal' to compute the overall average salary. Then select all employees earning more than this average.", solution: "WITH avg_sal AS (SELECT AVG(salary) AS av FROM employees) SELECT name, salary FROM employees, avg_sal WHERE salary > av", requiredKeywords: ["with", "avg_sal", "as", "select", "avg(salary)", "from", "employees", "where", "salary", ">"], database: "company" },
  { id: 'e27', difficulty: 'expert', topic: 'analytics', question: "Assign a dense rank named 'sal_rank' to each employee based on salary descending.", solution: "SELECT name, salary, DENSE_RANK() OVER (ORDER BY salary DESC) AS sal_rank FROM employees", requiredKeywords: ["select", "dense_rank()", "over", "order", "by", "salary", "desc", "as", "sal_rank", "from", "employees"], database: "company" },
  { id: 'e28', difficulty: 'expert', topic: 'analytics', question: "Rank products by price within their category using DENSE_RANK(). Name it 'cat_rank'.", solution: "SELECT product_name, category, price, DENSE_RANK() OVER (PARTITION BY category ORDER BY price DESC) AS cat_rank FROM products", requiredKeywords: ["select", "dense_rank()", "over", "partition", "by", "category", "order", "by", "price", "desc", "as", "cat_rank", "from", "products"], database: "ecommerce" },
  { id: 'e29', difficulty: 'expert', topic: 'analytics', question: "Calculate the running total of prices in products ordered by product_id. Name it 'run_price'.", solution: "SELECT product_id, product_name, price, SUM(price) OVER (ORDER BY product_id) AS run_price FROM products", requiredKeywords: ["select", "sum(price)", "over", "order", "by", "product_id", "as", "run_price", "from", "products"], database: "ecommerce" },
  { id: 'e30', difficulty: 'expert', topic: 'subqueries', question: "Find the employee name, department, and salary of employees who earn more than their manager. Use a self-join.", solution: "SELECT e.name, e.salary, m.name AS manager_name FROM employees e INNER JOIN employees m ON e.manager_id = m.id WHERE e.salary > m.salary", requiredKeywords: ["select", "join", "employees", "manager_id", "where", "salary", ">"], database: "company" }
];

// Expose globally
if (typeof window !== 'undefined') {
  window.PRACTICE_QUESTIONS = PRACTICE_QUESTIONS;
  window.EXAM_QUESTIONS = EXAM_QUESTIONS;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PRACTICE_QUESTIONS, EXAM_QUESTIONS };
}


// Expose globally
if (typeof window !== 'undefined') {
  window.PRACTICE_QUESTIONS = PRACTICE_QUESTIONS;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PRACTICE_QUESTIONS };
}
