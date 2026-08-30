// SQL Quest static databases containing structured sample data for the game
const DATABASES = {
  company: {
    employees: [
      { id: 1, name: 'Steven King', email: 'steven.king@company.com', salary: 150000, hire_date: '2018-06-17', job_id: 'AD_PRES', department_id: 90, manager_id: null },
      { id: 2, name: 'Neena Kochhar', email: 'neena.kochhar@company.com', salary: 120000, hire_date: '2019-09-21', job_id: 'AD_VP', department_id: 90, manager_id: 1 },
      { id: 3, name: 'Lex De Haan', email: 'lex.dehaan@company.com', salary: 115000, hire_date: '2019-01-13', job_id: 'AD_VP', department_id: 90, manager_id: 1 },
      { id: 4, name: 'Alexander Hunold', email: 'alexander.hunold@company.com', salary: 90000, hire_date: '2020-01-03', job_id: 'IT_PROG', department_id: 60, manager_id: 2 },
      { id: 5, name: 'Bruce Ernst', email: 'bruce.ernst@company.com', salary: 60000, hire_date: '2020-05-21', job_id: 'IT_PROG', department_id: 60, manager_id: 4 },
      { id: 6, name: 'David Lorentz', email: 'david.lorentz@company.com', salary: 48000, hire_date: '2021-02-07', job_id: 'IT_PROG', department_id: 60, manager_id: 4 },
      { id: 7, name: 'Kevin Mourgos', email: 'kevin.mourgos@company.com', salary: 85000, hire_date: '2021-11-16', job_id: 'SA_MAN', department_id: 80, manager_id: 2 },
      { id: 8, name: 'Trenna Rajs', email: 'trenna.rajs@company.com', salary: 55000, hire_date: '2022-08-17', job_id: 'SA_REP', department_id: 80, manager_id: 7 },
      { id: 9, name: 'Curtis Davies', email: 'curtis.davies@company.com', salary: 45000, hire_date: '2023-01-29', job_id: 'SA_REP', department_id: 80, manager_id: 7 },
      { id: 10, name: 'Jennifer Whalen', email: 'jennifer.whalen@company.com', salary: 40000, hire_date: '2015-09-17', job_id: 'AD_ASST', department_id: 10, manager_id: 3 },
      { id: 11, name: 'Randall Matos', email: 'randall.matos@company.com', salary: 32000, hire_date: '2022-07-09', job_id: 'ST_CLERK', department_id: 50, manager_id: 3 },
      { id: 12, name: 'Peter Vargas', email: 'peter.vargas@company.com', salary: 28000, hire_date: '2022-07-09', job_id: 'ST_CLERK', department_id: 50, manager_id: 3 },
      { id: 13, name: 'Eleni Zlotkey', email: 'eleni.zlotkey@company.com', salary: 105000, hire_date: '2020-01-29', job_id: 'SA_MAN', department_id: 80, manager_id: 1 },
      { id: 14, name: 'Ellen Abel', email: 'ellen.abel@company.com', salary: 74000, hire_date: '2021-05-11', job_id: 'SA_REP', department_id: 80, manager_id: 13 },
      { id: 15, name: 'Jonathon Taylor', email: 'jonathon.taylor@company.com', salary: 70000, hire_date: '2021-03-24', job_id: 'SA_REP', department_id: 80, manager_id: 13 }
    ],
    departments: [
      { department_id: 10, department_name: 'Administration', manager_id: 10, location_id: 1700 },
      { department_id: 50, department_name: 'Shipping', manager_id: 11, location_id: 1500 },
      { department_id: 60, department_name: 'IT', manager_id: 4, location_id: 1400 },
      { department_id: 80, department_name: 'Sales', manager_id: 7, location_id: 2500 },
      { department_id: 90, department_name: 'Executive', manager_id: 1, location_id: 1700 },
      { department_id: 110, department_name: 'Finance', manager_id: null, location_id: 1700 },
      { department_id: 190, department_name: 'Contracting', manager_id: null, location_id: 1700 }
    ],
    jobs: [
      { job_id: 'AD_PRES', job_title: 'President', min_salary: 20000, max_salary: 40000 },
      { job_id: 'AD_VP', job_title: 'Administration Vice President', min_salary: 15000, max_salary: 30000 },
      { job_id: 'IT_PROG', job_title: 'Programmer', min_salary: 4000, max_salary: 10000 },
      { job_id: 'SA_MAN', job_title: 'Sales Manager', min_salary: 10000, max_salary: 20008 },
      { job_id: 'SA_REP', job_title: 'Sales Representative', min_salary: 6000, max_salary: 12008 },
      { job_id: 'AD_ASST', job_title: 'Administration Assistant', min_salary: 3000, max_salary: 6000 },
      { job_id: 'ST_CLERK', job_title: 'Stock Clerk', min_salary: 2008, max_salary: 5000 }
    ],
    locations: [
      { location_id: 1400, street_address: '2014 Jabberwocky Rd', city: 'Southlake', state_province: 'Texas', country_id: 'US' },
      { location_id: 1500, street_address: '2011 Interiors Blvd', city: 'South San Francisco', state_province: 'California', country_id: 'US' },
      { location_id: 1700, street_address: '2004 Charade Rd', city: 'Seattle', state_province: 'Washington', country_id: 'US' },
      { location_id: 2500, street_address: 'Magdalen Centre, The Oxford Science Park', city: 'Oxford', state_province: 'Oxford', country_id: 'UK' }
    ]
  },
  ecommerce: {
    customers: [
      { customer_id: 101, first_name: 'John', last_name: 'Doe', email: 'john.doe@gmail.com', join_date: '2024-01-15' },
      { customer_id: 102, first_name: 'Jane', last_name: 'Smith', email: 'jane.smith@yahoo.com', join_date: '2024-02-10' },
      { customer_id: 103, first_name: 'Alice', last_name: 'Johnson', email: 'alice.j@outlook.com', join_date: '2024-03-01' },
      { customer_id: 104, first_name: 'Bob', last_name: 'Brown', email: 'bob.brown@gmail.com', join_date: '2024-03-15' },
      { customer_id: 105, first_name: 'Charlie', last_name: 'Davis', email: 'charlie.d@company.com', join_date: '2024-04-05' },
      { customer_id: 106, first_name: 'David', last_name: 'Miller', email: 'david.miller@gmail.com', join_date: '2024-04-12' }
    ],
    products: [
      { product_id: 1, product_name: 'Laptop EliteBook', category: 'Electronics', price: 1200, stock: 15 },
      { product_id: 2, product_name: 'Smartphone S24', category: 'Electronics', price: 800, stock: 25 },
      { product_id: 3, product_name: 'Noise Cancelling Headphones', category: 'Audio', price: 250, stock: 50 },
      { product_id: 4, product_name: 'Mechanical Keyboard', category: 'Accessories', price: 100, stock: 40 },
      { product_id: 5, product_name: 'Ergonomic Office Chair', category: 'Furniture', price: 350, stock: 10 }
    ],
    orders: [
      { order_id: 5001, customer_id: 101, order_date: '2024-05-01', total_amount: 1450 },
      { order_id: 5002, customer_id: 102, order_date: '2024-05-03', total_amount: 800 },
      { order_id: 5003, customer_id: 103, order_date: '2024-05-05', total_amount: 350 },
      { order_id: 5004, customer_id: 101, order_date: '2024-05-08', total_amount: 250 },
      { order_id: 5005, customer_id: 105, order_date: '2024-05-12', total_amount: 1200 }
    ],
    order_items: [
      { item_id: 201, order_id: 5001, product_id: 1, quantity: 1, price: 1200 },
      { item_id: 202, order_id: 5001, product_id: 3, quantity: 1, price: 250 },
      { item_id: 203, order_id: 5002, product_id: 2, quantity: 1, price: 800 },
      { item_id: 204, order_id: 5003, product_id: 3, quantity: 1, price: 250 },
      { item_id: 205, order_id: 5003, product_id: 4, quantity: 1, price: 100 },
      { item_id: 206, order_id: 5004, product_id: 3, quantity: 1, price: 250 },
      { item_id: 207, order_id: 5005, product_id: 1, quantity: 1, price: 1200 }
    ],
    payments: [
      { payment_id: 901, order_id: 5001, payment_date: '2024-05-01', payment_method: 'Credit Card', amount: 1450 },
      { payment_id: 902, order_id: 5002, payment_date: '2024-05-03', payment_method: 'PayPal', amount: 800 },
      { payment_id: 903, order_id: 5003, payment_date: '2024-05-05', payment_method: 'Credit Card', amount: 350 },
      { payment_id: 904, order_id: 5004, payment_date: '2024-05-08', payment_method: 'Debit Card', amount: 250 },
      { payment_id: 905, order_id: 5005, payment_date: '2024-05-12', payment_method: 'Credit Card', amount: 1200 }
    ]
  },
  hospital: {
    patients: [
      { patient_id: 301, name: 'Alice Rogers', age: 34, gender: 'F', city: 'New York' },
      { patient_id: 302, name: 'David Beckham', age: 48, gender: 'M', city: 'Miami' },
      { patient_id: 303, name: 'Sarah Connor', age: 29, gender: 'F', city: 'Los Angeles' },
      { patient_id: 304, name: 'Bruce Wayne', age: 41, gender: 'M', city: 'Gotham' },
      { patient_id: 305, name: 'Emma Watson', age: 33, gender: 'F', city: 'London' }
    ],
    doctors: [
      { doctor_id: 10, name: 'Dr. Gregory House', specialty: 'Diagnostics', room_no: '404' },
      { doctor_id: 20, name: 'Dr. Meredith Grey', specialty: 'General Surgery', room_no: '102' },
      { doctor_id: 30, name: 'Dr. Stephen Strange', specialty: 'Neurosurgery', room_no: '777' },
      { doctor_id: 40, name: 'Dr. Hannibal Lecter', specialty: 'Psychiatry', room_no: '201' }
    ],
    appointments: [
      { appointment_id: 801, patient_id: 301, doctor_id: 10, appointment_date: '2024-06-01', status: 'Completed' },
      { appointment_id: 802, patient_id: 302, doctor_id: 20, appointment_date: '2024-06-02', status: 'Completed' },
      { appointment_id: 803, patient_id: 303, doctor_id: 30, appointment_date: '2024-06-03', status: 'Cancelled' },
      { appointment_id: 804, patient_id: 304, doctor_id: 30, appointment_date: '2024-06-04', status: 'Completed' },
      { appointment_id: 805, patient_id: 305, doctor_id: 40, appointment_date: '2024-06-05', status: 'Pending' }
    ],
    treatments: [
      { treatment_id: 401, appointment_id: 801, description: 'MRI Scan & Biopsy', cost: 1500 },
      { treatment_id: 402, appointment_id: 802, description: 'Appendectomy', cost: 4500 },
      { treatment_id: 403, appointment_id: 804, description: 'Craniotomy', cost: 12000 }
    ],
    bills: [
      { bill_id: 701, patient_id: 301, amount: 1500, status: 'Paid' },
      { bill_id: 702, patient_id: 302, amount: 4500, status: 'Paid' },
      { bill_id: 703, patient_id: 304, amount: 12000, status: 'Unpaid' }
    ]
  },
  college: {
    students: [
      { student_id: 201, name: 'Alex Mercer', age: 20, major: 'Computer Science', enroll_year: 2022 },
      { student_id: 202, name: 'Emma Frost', age: 21, major: 'Physics', enroll_year: 2021 },
      { student_id: 203, name: 'Peter Parker', age: 19, major: 'Biochemistry', enroll_year: 2023 },
      { student_id: 204, name: 'Clark Kent', age: 22, major: 'Journalism', enroll_year: 2020 },
      { student_id: 205, name: 'Bruce Banner', age: 23, major: 'Nuclear Engineering', enroll_year: 2019 }
    ],
    courses: [
      { course_id: 'CS101', course_name: 'Introduction to SQL', credits: 3, department: 'Computer Science' },
      { course_id: 'PHY201', course_name: 'Classical Mechanics', credits: 4, department: 'Physics' },
      { course_id: 'BIO301', course_name: 'Genetics', credits: 3, department: 'Biology' },
      { course_id: 'JRN102', course_name: 'Investigative Reporting', credits: 3, department: 'Humanities' },
      { course_id: 'NUC401', course_name: 'Quantum Physics', credits: 4, department: 'Physics' }
    ],
    teachers: [
      { teacher_id: 50, name: 'Prof. Charles Xavier', department: 'Biology' },
      { teacher_id: 51, name: 'Prof. Otto Octavius', department: 'Nuclear Engineering' },
      { teacher_id: 52, name: 'Prof. Perry White', department: 'Humanities' }
    ],
    enrollments: [
      { enroll_id: 601, student_id: 201, course_id: 'CS101', semester: 'Fall 2023', grade: 'A' },
      { enroll_id: 602, student_id: 202, course_id: 'PHY201', semester: 'Fall 2023', grade: 'B' },
      { enroll_id: 603, student_id: 203, course_id: 'BIO301', semester: 'Spring 2024', grade: 'A' },
      { enroll_id: 604, student_id: 204, course_id: 'JRN102', semester: 'Spring 2024', grade: 'C' },
      { enroll_id: 605, student_id: 201, course_id: 'PHY201', semester: 'Fall 2023', grade: 'A' }
    ]
  }
};

// Expose to window/global scope if running in browser
if (typeof window !== 'undefined') {
  window.DATABASES = DATABASES;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DATABASES };
}
