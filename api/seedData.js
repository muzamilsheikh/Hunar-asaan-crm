const { sequelize, User, Student } = require('./models');
const bcrypt = require('bcryptjs');

const seedData = async () => {
  try {
    console.log('🌱 Starting data seeding...');

    // Create master admin user
    const hashedAdminPassword = await bcrypt.hash('Hunar123@321@123', 10);
    const [adminUser, adminCreated] = await User.findOrCreate({
      where: { email: 'admin@hunarasaan.com' },
      defaults: {
        name: 'Admin User',
        email: 'admin@hunarasaan.com',
        password: hashedAdminPassword,
        role: 'Admin'
      }
    });
    
    if (adminCreated) {
      console.log('✅ Master Admin created:', adminUser.email);
    } else {
      // Update existing admin's role in case it was changed
      await adminUser.update({ role: 'Admin', password: hashedAdminPassword });
      console.log('✅ Master Admin updated:', adminUser.email);
    }

    // Hash password for students
    const hashedStudentPassword = await bcrypt.hash('12345678', 10);

    // Student data to seed
    const studentsData = [
      {
        id: 1,
        name: 'Zeenat Bibi',
        email: 'zbarra1390@gmail.com',
        phone: '03061712342',
        totalFee: 28000,
        paidAmount: 28000,
        status: 'Active',
        payments: [
          { installmentNumber: 1, amount: 14000, status: 'Paid', date: '2023-01-15' },
          { installmentNumber: 2, amount: 14000, status: 'Paid', date: '2023-02-15' }
        ]
      },
      {
        id: 2,
        name: 'Lubna Junaid',
        email: 'lubnairshadali@gmail.com',
        phone: '03037706618',
        totalFee: 30000,
        paidAmount: 30000,
        status: 'Active',
        payments: [
          { installmentNumber: 1, amount: 15000, status: 'Paid', date: '2023-01-20' },
          { installmentNumber: 2, amount: 15000, status: 'Paid', date: '2023-02-20' }
        ]
      },
      {
        id: 3,
        name: 'Kashaf Habib',
        email: 'kashafhabib12@gmail.com',
        phone: '03402050675',
        totalFee: 30000,
        paidAmount: 30000,
        status: 'Active',
        payments: [
          { installmentNumber: 1, amount: 15000, status: 'Paid', date: '2023-01-25' },
          { installmentNumber: 2, amount: 15000, status: 'Paid', date: '2023-02-25' }
        ]
      },
      {
        id: 4,
        name: 'Kanza Kashif',
        email: 'kanzakashif94@gmail.com',
        phone: '03121134401',
        totalFee: 30000,
        paidAmount: 30000,
        status: 'Active',
        payments: [
          { installmentNumber: 1, amount: 15000, status: 'Paid', date: '2023-02-01' },
          { installmentNumber: 2, amount: 15000, status: 'Paid', date: '2023-03-01' }
        ]
      },
      {
        id: 5,
        name: 'Zahid Naseeb Ansari',
        email: 'arasahmetansari@gmail.com',
        phone: '03120311660',
        totalFee: 25000,
        paidAmount: 25000,
        status: 'Active',
        payments: [
          { installmentNumber: 1, amount: 12500, status: 'Paid', date: '2023-02-05' },
          { installmentNumber: 2, amount: 12500, status: 'Paid', date: '2023-03-05' }
        ]
      },
      {
        id: 6,
        name: 'Saqiba Sattar Hashmi',
        email: 'saadiahaleema00@gmail.com',
        phone: '03016001901',
        totalFee: 30000,
        paidAmount: 30000,
        status: 'Active',
        payments: [
          { installmentNumber: 1, amount: 15000, status: 'Paid', date: '2023-02-10' },
          { installmentNumber: 2, amount: 15000, status: 'Paid', date: '2023-03-10' }
        ]
      },
      {
        id: 7,
        name: 'Hamna Iqbal',
        email: 'hamnaiqbal555@yahoo.com',
        phone: '03344872848',
        totalFee: 28000,
        paidAmount: 28000,
        status: 'Active',
        payments: [
          { installmentNumber: 1, amount: 14000, status: 'Paid', date: '2023-02-15' },
          { installmentNumber: 2, amount: 14000, status: 'Paid', date: '2023-03-15' }
        ]
      },
      {
        id: 8,
        name: 'Anam Tahir',
        email: 'anamtahir301@gmail.com',
        phone: '03364186155',
        totalFee: 30000,
        paidAmount: 30000,
        status: 'Active',
        payments: [
          { installmentNumber: 1, amount: 15000, status: 'Paid', date: '2023-02-20' },
          { installmentNumber: 2, amount: 15000, status: 'Paid', date: '2023-03-20' }
        ]
      },
      {
        id: 9,
        name: 'Mustafa Hayiat',
        email: 'mustafahayat35202@gmail.com',
        phone: '03154524419',
        totalFee: 30000,
        paidAmount: 30000,
        status: 'Active',
        payments: [
          { installmentNumber: 1, amount: 15000, status: 'Paid', date: '2023-02-25' },
          { installmentNumber: 2, amount: 15000, status: 'Paid', date: '2023-03-25' }
        ]
      },
      {
        id: 10,
        name: 'MUHAMMAD HUSSAIN',
        email: 'lalachaudhary158@gmail.com',
        phone: '03097251420',
        totalFee: 28000,
        paidAmount: 28000,
        status: 'Active',
        payments: [
          { installmentNumber: 1, amount: 14000, status: 'Paid', date: '2023-03-01' },
          { installmentNumber: 2, amount: 14000, status: 'Paid', date: '2023-04-01' }
        ]
      },
      {
        id: 11,
        name: 'Dawood Ali',
        email: 'dawood9977ali@gmail.com',
        phone: '03065050939',
        totalFee: 30000,
        paidAmount: 30000,
        status: 'Active',
        payments: [
          { installmentNumber: 1, amount: 15000, status: 'Paid', date: '2023-03-05' },
          { installmentNumber: 2, amount: 15000, status: 'Paid', date: '2023-04-05' }
        ]
      },
      {
        id: 12,
        name: 'Sannia Tariq',
        email: 'sannia29@gmail.com',
        phone: '03002457761',
        totalFee: 28000,
        paidAmount: 28000,
        status: 'Active',
        payments: [
          { installmentNumber: 1, amount: 14000, status: 'Paid', date: '2023-03-10' },
          { installmentNumber: 2, amount: 14000, status: 'Paid', date: '2023-04-10' }
        ]
      },
      {
        id: 13,
        name: 'Mashal Jabbbar',
        email: 'mashal.jabbar786@gmail.com',
        phone: '03075360174',
        totalFee: 28000,
        paidAmount: 28000,
        status: 'Active',
        payments: [
          { installmentNumber: 1, amount: 14000, status: 'Paid', date: '2023-03-15' },
          { installmentNumber: 2, amount: 14000, status: 'Paid', date: '2023-04-15' }
        ]
      },
      {
        id: 14,
        name: 'Javeria Jamshed',
        email: 'javeriajamshed24@gmail.com',
        phone: '03130702200',
        totalFee: 28000,
        paidAmount: 28000,
        status: 'Active',
        payments: [
          { installmentNumber: 1, amount: 14000, status: 'Paid', date: '2023-03-20' },
          { installmentNumber: 2, amount: 14000, status: 'Paid', date: '2023-04-20' }
        ]
      }
    ];

    // Create or update students
    for (const studentData of studentsData) {
      // First create the user
      const [user, userCreated] = await User.findOrCreate({
        where: { email: studentData.email },
        defaults: {
          name: studentData.name,
          email: studentData.email,
          password: hashedStudentPassword,
          role: 'Student'
        }
      });

      // Extract payments data and create student without payments in the defaults
      const { payments, ...studentDefaults } = studentData;
      
      // Then create the student record
      const [student, studentCreated] = await Student.findOrCreate({
        where: { email: studentData.email },
        defaults: {
          ...studentDefaults,
          courseId: null,  // Add default values if needed
          batchId: null
        }
      });

      // Update if exists and set payments separately if needed
      if (!studentCreated) {
        await student.update({
          name: studentData.name,
          phone: studentData.phone,
          totalFee: studentData.totalFee,
          paidAmount: studentData.paidAmount,
          status: studentData.status
        });
      }

      // Now update the payments field specifically
      await student.update({
        payments: studentData.payments
      });

      console.log(`✅ Student ${studentData.id}: ${studentData.name} (${studentData.email}) - ${studentData.status}`);
    }

    console.log('\n✅ Admin and 14 Students restored with financial records successfully');
    console.log('📝 Admin credentials: admin@hunarasaan.com / Hunar123@321@123');
    console.log('📝 Student default password: 12345678');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();