import { describe, it, beforeEach, afterEach } from 'mocha';
import { expect } from 'chai';
import sistemaAcueductoService from '../src/services/catalog/sistemaAcueductoService.js';
import SistemaAcueducto from '../src/models/catalog/SistemaAcueducto.js';

describe('Sistema Acueducto Service', () => {
  let testSistemaId;

  beforeEach(async () => {
    // Clean up any existing test data
    await SistemaAcueducto.destroy({
      where: {
        proveedor: 'Test Provider'
      },
      force: true
    });
  });

  afterEach(async () => {
    // Clean up test data
    if (testSistemaId) {
      try {
        await SistemaAcueducto.destroy({
          where: { id_sistemas_acueducto: testSistemaId },
          force: true
        });
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  });

  describe('createSistemaAcueducto', () => {
    it('should create a new sistema de acueducto successfully', async () => {
      const sistemaData = {
        proveedor: 'Test Provider',
        metodo_abastecimiento: 'Test Method',
        descripcion: 'Test Description'
      };

      const result = await sistemaAcueductoService.createSistemaAcueducto(sistemaData);
      testSistemaId = result.id_sistemas_acueducto;

      expect(result).to.be.an('object');
      expect(result.proveedor).to.equal(sistemaData.proveedor);
      expect(result.metodo_abastecimiento).to.equal(sistemaData.metodo_abastecimiento);
      expect(result.descripcion).to.equal(sistemaData.descripcion);
    });

    it('should throw error when creating duplicate sistema', async () => {
      const sistemaData = {
        proveedor: 'Test Provider',
        metodo_abastecimiento: 'Test Method',
        descripcion: 'Test Description'
      };

      // Create first sistema
      const first = await sistemaAcueductoService.createSistemaAcueducto(sistemaData);
      testSistemaId = first.id_sistemas_acueducto;

      // Try to create duplicate
      try {
        await sistemaAcueductoService.createSistemaAcueducto(sistemaData);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('already exists');
      }
    });

    it('should trim whitespace from input', async () => {
      const sistemaData = {
        proveedor: '  Test Provider  ',
        metodo_abastecimiento: '  Test Method  ',
        descripcion: '  Test Description  '
      };

      const result = await sistemaAcueductoService.createSistemaAcueducto(sistemaData);
      testSistemaId = result.id_sistemas_acueducto;

      expect(result.proveedor).to.equal('Test Provider');
      expect(result.metodo_abastecimiento).to.equal('Test Method');
      expect(result.descripcion).to.equal('Test Description');
    });
  });

  describe('getAllSistemasAcueducto', () => {
    beforeEach(async () => {
      // Create test data
      const testData = [
        {
          proveedor: 'Provider A',
          metodo_abastecimiento: 'Method A',
          descripcion: 'Description A'
        },
        {
          proveedor: 'Provider B',
          metodo_abastecimiento: 'Method B',
          descripcion: 'Description B'
        }
      ];

      for (const data of testData) {
        await SistemaAcueducto.create(data);
      }
    });

    it('should return paginated results', async () => {
      const result = await sistemaAcueductoService.getAllSistemasAcueducto({
        page: 1,
        limit: 1
      });

      expect(result).to.have.property('sistemasAcueducto');
      expect(result).to.have.property('pagination');
      expect(result.sistemasAcueducto).to.be.an('array');
      expect(result.sistemasAcueducto.length).to.be.at.most(1);
      expect(result.pagination).to.have.property('totalCount');
      expect(result.pagination).to.have.property('currentPage');
    });

    it('should filter by search term', async () => {
      const result = await sistemaAcueductoService.getAllSistemasAcueducto({
        search: 'Provider A'
      });

      expect(result.sistemasAcueducto.length).to.be.at.least(1);
      expect(result.sistemasAcueducto[0].proveedor).to.include('Provider A');
    });

    it('should filter by proveedor', async () => {
      const result = await sistemaAcueductoService.getAllSistemasAcueducto({
        proveedor: 'Provider A'
      });

      expect(result.sistemasAcueducto.length).to.be.at.least(1);
      result.sistemasAcueducto.forEach(sistema => {
        expect(sistema.proveedor.toLowerCase()).to.include('provider a');
      });
    });
  });

  describe('getSistemaAcueductoById', () => {
    beforeEach(async () => {
      const sistema = await SistemaAcueducto.create({
        proveedor: 'Test Provider',
        metodo_abastecimiento: 'Test Method',
        descripcion: 'Test Description'
      });
      testSistemaId = sistema.id_sistemas_acueducto;
    });

    it('should return sistema by ID', async () => {
      const result = await sistemaAcueductoService.getSistemaAcueductoById(testSistemaId);

      expect(result).to.be.an('object');
      expect(result.id_sistemas_acueducto).to.equal(testSistemaId);
      expect(result.proveedor).to.equal('Test Provider');
    });

    it('should throw error for non-existent ID', async () => {
      try {
        await sistemaAcueductoService.getSistemaAcueductoById(99999);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('not found');
      }
    });
  });

  describe('updateSistemaAcueducto', () => {
    beforeEach(async () => {
      const sistema = await SistemaAcueducto.create({
        proveedor: 'Test Provider',
        metodo_abastecimiento: 'Test Method',
        descripcion: 'Test Description'
      });
      testSistemaId = sistema.id_sistemas_acueducto;
    });

    it('should update sistema successfully', async () => {
      const updateData = {
        descripcion: 'Updated Description'
      };

      const result = await sistemaAcueductoService.updateSistemaAcueducto(testSistemaId, updateData);

      expect(result.descripcion).to.equal('Updated Description');
      expect(result.proveedor).to.equal('Test Provider'); // Should remain unchanged
    });

    it('should throw error for non-existent ID', async () => {
      try {
        await sistemaAcueductoService.updateSistemaAcueducto(99999, { descripcion: 'Test' });
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('not found');
      }
    });
  });

  describe('deleteSistemaAcueducto', () => {
    beforeEach(async () => {
      const sistema = await SistemaAcueducto.create({
        proveedor: 'Test Provider',
        metodo_abastecimiento: 'Test Method',
        descripcion: 'Test Description'
      });
      testSistemaId = sistema.id_sistemas_acueducto;
    });

    it('should delete sistema successfully', async () => {
      const result = await sistemaAcueductoService.deleteSistemaAcueducto(testSistemaId);

      expect(result).to.have.property('message');
      expect(result.message).to.include('deleted successfully');

      // Verify deletion
      try {
        await sistemaAcueductoService.getSistemaAcueductoById(testSistemaId);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('not found');
      }

      testSistemaId = null; // Prevent cleanup
    });

    it('should throw error for non-existent ID', async () => {
      try {
        await sistemaAcueductoService.deleteSistemaAcueducto(99999);
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error.message).to.include('not found');
      }
    });
  });

  describe('searchSistemasAcueducto', () => {
    beforeEach(async () => {
      const testData = [
        {
          proveedor: 'Municipal Water',
          metodo_abastecimiento: 'Public Network',
          descripcion: 'Municipal service'
        },
        {
          proveedor: 'Private Well',
          metodo_abastecimiento: 'Artesian Well',
          descripcion: 'Private water source'
        }
      ];

      for (const data of testData) {
        await SistemaAcueducto.create(data);
      }
    });

    it('should find sistemas by search term', async () => {
      const result = await sistemaAcueductoService.searchSistemasAcueducto('Municipal');

      expect(result).to.be.an('array');
      expect(result.length).to.be.at.least(1);
      expect(result[0].proveedor.toLowerCase()).to.include('municipal');
    });

    it('should limit results', async () => {
      const result = await sistemaAcueductoService.searchSistemasAcueducto('Water', { limit: 1 });

      expect(result).to.be.an('array');
      expect(result.length).to.be.at.most(1);
    });
  });

  describe('getStatistics', () => {
    beforeEach(async () => {
      const testData = [
        {
          proveedor: 'Provider A',
          metodo_abastecimiento: 'Method X',
          descripcion: 'Description 1'
        },
        {
          proveedor: 'Provider B',
          metodo_abastecimiento: 'Method Y',
          descripcion: 'Description 2'
        },
        {
          proveedor: 'Provider A',
          metodo_abastecimiento: 'Method Z',
          descripcion: 'Description 3'
        }
      ];

      for (const data of testData) {
        await SistemaAcueducto.create(data);
      }
    });

    it('should return correct statistics', async () => {
      const result = await sistemaAcueductoService.getStatistics();

      expect(result).to.have.property('totalSistemas');
      expect(result).to.have.property('totalProviders');
      expect(result).to.have.property('totalMethods');
      expect(result).to.have.property('providers');
      expect(result).to.have.property('methods');

      expect(result.totalSistemas).to.be.at.least(3);
      expect(result.totalProviders).to.be.at.least(2);
      expect(result.totalMethods).to.be.at.least(3);
      expect(result.providers).to.be.an('array');
      expect(result.methods).to.be.an('array');
    });
  });

  describe('bulkCreateSistemasAcueducto', () => {
    it('should create multiple sistemas', async () => {
      const sistemasData = [
        {
          proveedor: 'Bulk Provider 1',
          metodo_abastecimiento: 'Bulk Method 1',
          descripcion: 'Bulk Description 1'
        },
        {
          proveedor: 'Bulk Provider 2',
          metodo_abastecimiento: 'Bulk Method 2',
          descripcion: 'Bulk Description 2'
        }
      ];

      const result = await sistemaAcueductoService.bulkCreateSistemasAcueducto(sistemasData);

      expect(result).to.be.an('array');
      expect(result.length).to.equal(2);
      expect(result[0]).to.have.property('id_sistemas_acueducto');
      expect(result[1]).to.have.property('id_sistemas_acueducto');

      // Clean up
      for (const sistema of result) {
        await SistemaAcueducto.destroy({
          where: { id_sistemas_acueducto: sistema.id_sistemas_acueducto },
          force: true
        });
      }
    });
  });
});
