'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // 1. Insert Company (COM_CODIGO = 42)
    await queryInterface.bulkInsert('seg_maecompania', [{
      COM_CODIGO: 42,
      COM_RUCI: '1791234567001',
      COM_NOMBRE: 'EMPRESA ABC S.A.',
      createdAt: now,
      updatedAt: now
    }], {});

    // 2. Insert User (USU_CODIGO = 1, linked to COM_CODIGO = 42)
    // We use cleartext password 'admin123' for simple demo validation as requested
    await queryInterface.bulkInsert('seg_maeusuario', [{
      USU_CODIGO: 1,
      COM_CODIGO: 42,
      USU_IDENTIFICACION: '1791234567001',
      USU_CLAVE: 'admin123',
      createdAt: now,
      updatedAt: now
    }], {});

    // 3. Insert Clients
    await queryInterface.bulkInsert('ven_maecliente', [
      {
        CLI_CODIGO: 1,
        COM_CODIGO: 42,
        CLI_NOMBRE: 'FARMACIA ABC',
        CLI_RUCIDE: '1791234567001',
        createdAt: now,
        updatedAt: now
      },
      {
        CLI_CODIGO: 2,
        COM_CODIGO: 42,
        CLI_NOMBRE: 'DISTRIBUIDORA XYZ',
        CLI_RUCIDE: '0992345678001',
        createdAt: now,
        updatedAt: now
      },
      {
        CLI_CODIGO: 3,
        COM_CODIGO: 42,
        CLI_NOMBRE: 'COMERCIAL NORTE',
        CLI_RUCIDE: '1705678901001',
        createdAt: now,
        updatedAt: now
      },
      {
        CLI_CODIGO: 4,
        COM_CODIGO: 42,
        CLI_NOMBRE: 'CONSUMIDOR FINAL',
        CLI_RUCIDE: '9999999999999',
        createdAt: now,
        updatedAt: now
      }
    ], {});

    // 4. Insert Groups
    await queryInterface.bulkInsert('inv_maegrupo', [
      {
        GRUP_CODIGO: 1,
        COM_CODIGO: 42,
        GRUP_NOMBRE: 'Medicamentos',
        createdAt: now,
        updatedAt: now
      },
      {
        GRUP_CODIGO: 2,
        COM_CODIGO: 42,
        GRUP_NOMBRE: 'Antibióticos',
        createdAt: now,
        updatedAt: now
      },
      {
        GRUP_CODIGO: 3,
        COM_CODIGO: 42,
        GRUP_NOMBRE: 'Analgésicos',
        createdAt: now,
        updatedAt: now
      }
    ], {});

    // 5. Insert Articles
    await queryInterface.bulkInsert('inv_maearticulo', [
      {
        ART_CODIGO: 1,
        COM_CODIGO: 42,
        GRUP_CODIGO: 1,
        ART_NOMBRE: 'PARACETAMOL 500MG',
        ART_CODIGOPRINCIPAL: 'MED001',
        createdAt: now,
        updatedAt: now
      },
      {
        ART_CODIGO: 2,
        COM_CODIGO: 42,
        GRUP_CODIGO: 2,
        ART_NOMBRE: 'AMOXICILINA 500MG',
        ART_CODIGOPRINCIPAL: 'MED042',
        createdAt: now,
        updatedAt: now
      },
      {
        ART_CODIGO: 3,
        COM_CODIGO: 42,
        GRUP_CODIGO: 3,
        ART_NOMBRE: 'IBUPROFENO 400MG',
        ART_CODIGOPRINCIPAL: 'MED018',
        createdAt: now,
        updatedAt: now
      }
    ], {});

    // Helper to generate a date in a specific month
    const getDateInMonth = (year, monthZeroIndexed, day) => {
      return new Date(year, monthZeroIndexed, day, 12, 0, 0);
    };

    // 6. Invoices (Cabecera ven_encfac)
    // We will generate 45 invoices for Mayo 2025 to match the mockup exactly:
    // Client 1 (FARMACIA ABC): 18 invoices, total $12,450
    // Client 2 (DISTRIBUIDORA XYZ): 11 invoices, total $8,200
    // Client 3 (COMERCIAL NORTE): 7 invoices, total $5,100
    // Client 4 (CONSUMIDOR FINAL): 9 invoices, total $3,150
    // TOTAL invoices = 45. TOTAL Base IVA = $20,000, Base 0% = $8,900, IVA = $2,400, Total = $28,900
    const invoices2025 = [];
    const invoiceDetails2025 = [];
    let invoiceIdCounter = 1;
    let detailIdCounter = 1;

    // Distribution arrays to make up the totals:
    // We want the total baseiva to be 20000, basecero to be 8900, valoriva to be 2400, total to be 28900
    // Let's create the 45 invoices with proportionate values
    const clientDistribution = [
      { id: 1, count: 18, totalSum: 12450 },
      { id: 2, count: 11, totalSum: 8200 },
      { id: 3, count: 7, totalSum: 5100 },
      { id: 4, count: 9, totalSum: 3150 }
    ];

    let totalBaseIva = 0;
    let totalBaseCero = 0;
    let totalValorIva = 0;
    let totalFactSum = 0;

    const targetBaseIva = 20000;
    const targetBaseCero = 8900;
    const targetValorIva = 2400;
    const targetTotal = 28900;

    for (let cDist of clientDistribution) {
      let clientTotalAllocated = 0;
      for (let i = 0; i < cDist.count; i++) {
        const isLast = (i === cDist.count - 1);
        
        // Determine values
        let baseIva = 0;
        let baseCero = 0;
        let valorIva = 0;
        let total = 0;

        if (isLast) {
          total = cDist.totalSum - clientTotalAllocated;
        } else {
          total = Math.round((cDist.totalSum / cDist.count) * 100) / 100;
        }
        clientTotalAllocated += total;

        // Roughly split 70% Base IVA and 30% Base 0%
        baseIva = Math.round((total * 0.692) * 100) / 100;
        baseCero = Math.round((total - baseIva) * 100) / 100;
        valorIva = Math.round((baseIva * 0.12) * 100) / 100;
        
        // Adjust values so sum = total
        totalBaseIva += baseIva;
        totalBaseCero += baseCero;
        totalValorIva += valorIva;
        totalFactSum += total;

        const date = getDateInMonth(2025, 4, Math.floor(Math.random() * 28) + 1); // May 2025

        invoices2025.push({
          ENCFAC_CODIGO: invoiceIdCounter,
          COM_CODIGO: 42,
          CLI_CODIGO: cDist.id,
          ENCFAC_FECHAEMISION: date,
          ENCFAC_BASEIVA: baseIva,
          ENCFAC_BASECERO: baseCero,
          ENCFAC_VALORIVA: valorIva,
          ENCFAC_TOTAL: total,
          createdAt: date,
          updatedAt: date
        });

        // Insert some details for first few invoices to get Top Articles matching:
        // Paracetamol 500mg: 450 units, total $1,350 (price: $3.00/unit)
        // Amoxicilina 500mg: 312 units, total $4,680 (price: $15.00/unit)
        // Ibuprofeno 400mg: 280 units, total $840 (price: $3.00/unit)
        if (invoiceIdCounter <= 3) {
          // Invoice 1 gets Paracetamol
          invoiceDetails2025.push({
            DETFAC_CODIGO: detailIdCounter++,
            COM_CODIGO: 42,
            ENCFAC_CODIGO: invoiceIdCounter,
            ART_CODIGO: 1, // Paracetamol
            DETFAC_CANTIDAD: 450.00,
            DETFAC_TOTAL: 1350.00,
            createdAt: date,
            updatedAt: date
          });
          // Invoice 2 gets Amoxicilina
          invoiceDetails2025.push({
            DETFAC_CODIGO: detailIdCounter++,
            COM_CODIGO: 42,
            ENCFAC_CODIGO: invoiceIdCounter,
            ART_CODIGO: 2, // Amoxicilina
            DETFAC_CANTIDAD: 312.00,
            DETFAC_TOTAL: 4680.00,
            createdAt: date,
            updatedAt: date
          });
          // Invoice 3 gets Ibuprofeno
          invoiceDetails2025.push({
            DETFAC_CODIGO: detailIdCounter++,
            COM_CODIGO: 42,
            ENCFAC_CODIGO: invoiceIdCounter,
            ART_CODIGO: 3, // Ibuprofeno
            DETFAC_CANTIDAD: 280.00,
            DETFAC_TOTAL: 840.00,
            createdAt: date,
            updatedAt: date
          });
        }

        invoiceIdCounter++;
      }
    }

    // Force perfect adjustment of totals for May 2025 (to match mockup values exactly)
    // We adjust the very first invoice to absorb any roundings
    const diffBaseIva = targetBaseIva - totalBaseIva;
    const diffBaseCero = targetBaseCero - totalBaseCero;
    const diffValorIva = targetValorIva - totalValorIva;
    const diffTotal = targetTotal - totalFactSum;

    invoices2025[0].ENCFAC_BASEIVA = Math.round((invoices2025[0].ENCFAC_BASEIVA + diffBaseIva) * 100) / 100;
    invoices2025[0].ENCFAC_BASECERO = Math.round((invoices2025[0].ENCFAC_BASECERO + diffBaseCero) * 100) / 100;
    invoices2025[0].ENCFAC_VALORIVA = Math.round((invoices2025[0].ENCFAC_VALORIVA + diffValorIva) * 100) / 100;
    invoices2025[0].ENCFAC_TOTAL = Math.round((invoices2025[0].ENCFAC_TOTAL + diffTotal) * 100) / 100;

    await queryInterface.bulkInsert('ven_encfac', invoices2025, {});
    await queryInterface.bulkInsert('ven_detfac', invoiceDetails2025, {});


    // 7. Seed identical mock data for May 2026 (the CURRENT month in the system runtime)
    // This allows the user to see matching aggregates when querying "Este mes" (dynamic query for 2026)
    const invoices2026 = [];
    const invoiceDetails2026 = [];

    for (let cDist of clientDistribution) {
      let clientTotalAllocated = 0;
      for (let i = 0; i < cDist.count; i++) {
        const isLast = (i === cDist.count - 1);
        
        let baseIva = 0;
        let baseCero = 0;
        let valorIva = 0;
        let total = 0;

        if (isLast) {
          total = cDist.totalSum - clientTotalAllocated;
        } else {
          total = Math.round((cDist.totalSum / cDist.count) * 100) / 100;
        }
        clientTotalAllocated += total;

        baseIva = Math.round((total * 0.692) * 100) / 100;
        baseCero = Math.round((total - baseIva) * 100) / 100;
        valorIva = Math.round((baseIva * 0.12) * 100) / 100;

        const date = getDateInMonth(2026, 4, Math.floor(Math.random() * 20) + 1); // May 2026 (until May 20th)

        invoices2026.push({
          ENCFAC_CODIGO: invoiceIdCounter,
          COM_CODIGO: 42,
          CLI_CODIGO: cDist.id,
          ENCFAC_FECHAEMISION: date,
          ENCFAC_BASEIVA: baseIva,
          ENCFAC_BASECERO: baseCero,
          ENCFAC_VALORIVA: valorIva,
          ENCFAC_TOTAL: total,
          createdAt: date,
          updatedAt: date
        });

        // Seed some details for top articles for May 2026 too
        if (i === 0) {
          // Paracetamol
          invoiceDetails2026.push({
            DETFAC_CODIGO: detailIdCounter++,
            COM_CODIGO: 42,
            ENCFAC_CODIGO: invoiceIdCounter,
            ART_CODIGO: 1,
            DETFAC_CANTIDAD: 200.00,
            DETFAC_TOTAL: 600.00,
            createdAt: date,
            updatedAt: date
          });
        } else if (i === 1) {
          // Amoxicilina
          invoiceDetails2026.push({
            DETFAC_CODIGO: detailIdCounter++,
            COM_CODIGO: 42,
            ENCFAC_CODIGO: invoiceIdCounter,
            ART_CODIGO: 2,
            DETFAC_CANTIDAD: 150.00,
            DETFAC_TOTAL: 2250.00,
            createdAt: date,
            updatedAt: date
          });
        }

        invoiceIdCounter++;
      }
    }

    // Force perfect adjustment of totals for May 2026
    invoices2026[0].ENCFAC_BASEIVA = Math.round((invoices2026[0].ENCFAC_BASEIVA + diffBaseIva) * 100) / 100;
    invoices2026[0].ENCFAC_BASECERO = Math.round((invoices2026[0].ENCFAC_BASECERO + diffBaseCero) * 100) / 100;
    invoices2026[0].ENCFAC_VALORIVA = Math.round((invoices2026[0].ENCFAC_VALORIVA + diffValorIva) * 100) / 100;
    invoices2026[0].ENCFAC_TOTAL = Math.round((invoices2026[0].ENCFAC_TOTAL + diffTotal) * 100) / 100;

    await queryInterface.bulkInsert('ven_encfac', invoices2026, {});
    await queryInterface.bulkInsert('ven_detfac', invoiceDetails2026, {});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('ven_detfac', null, {});
    await queryInterface.bulkDelete('ven_encfac', null, {});
    await queryInterface.bulkDelete('inv_maearticulo', null, {});
    await queryInterface.bulkDelete('inv_maegrupo', null, {});
    await queryInterface.bulkDelete('ven_maecliente', null, {});
    await queryInterface.bulkDelete('seg_maeusuario', null, {});
    await queryInterface.bulkDelete('seg_maecompania', null, {});
  }
};
