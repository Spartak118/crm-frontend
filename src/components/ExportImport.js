import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useNotifications } from '../contexts/NotificationContext';
import './ExportImport.css';

const ExportImport = ({ customers, onImport, type = 'customers' }) => {
  const [showModal, setShowModal] = useState(false);
  const [importData, setImportData] = useState(null);
  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);
  const { addNotification } = useNotifications();

  // Экспорт в Excel
  const exportToExcel = () => {
    setLoading(true);
    try {
      // Подготовка данных для экспорта
      let dataToExport = [];
      
      if (type === 'customers') {
        dataToExport = customers.map(c => ({
          ID: c.id,
          Name: c.name,
          Email: c.email,
          Phone: c.phone,
          Company: c.company,
          Status: c.status,
          'Last Contact': c.lastContact,
          'Deals ($)': c.deals
        }));
      } else if (type === 'deals') {
        // Для сделок (добавим позже)
      }

      // Создаем рабочий лист
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      
      // Создаем рабочую книгу
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, type);
      
      // Генерируем файл
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
      
      // Сохраняем файл
      const fileName = `${type}_${new Date().toISOString().split('T')[0]}.xlsx`;
      saveAs(data, fileName);

      addNotification({
        title: '📥 Export Successful',
        message: `${dataToExport.length} records exported to Excel`,
        icon: '✅',
        type: 'success'
      });
    } catch (error) {
      addNotification({
        title: '❌ Export Failed',
        message: error.message,
        icon: '⚠️',
        type: 'error'
      });
    }
    setLoading(false);
  };

  // Экспорт в CSV
  const exportToCSV = () => {
    setLoading(true);
    try {
      let dataToExport = [];
      
      if (type === 'customers') {
        dataToExport = customers.map(c => ({
          Name: c.name,
          Email: c.email,
          Phone: c.phone,
          Company: c.company,
          Status: c.status,
          'Last Contact': c.lastContact,
          'Deals': c.deals
        }));
      }

      // Создаем CSV
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const csv = XLSX.utils.sheet_to_csv(ws);
      
      // Сохраняем файл
      const fileName = `${type}_${new Date().toISOString().split('T')[0]}.csv`;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      saveAs(blob, fileName);

      addNotification({
        title: '📥 CSV Export Successful',
        message: `${dataToExport.length} records exported to CSV`,
        icon: '✅',
        type: 'success'
      });
    } catch (error) {
      addNotification({
        title: '❌ Export Failed',
        message: error.message,
        icon: '⚠️',
        type: 'error'
      });
    }
    setLoading(false);
  };

  // Обработка загруженного файла
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Показываем предпросмотр (первые 5 записей)
        setPreviewData(jsonData.slice(0, 5));
        setImportData(jsonData);
      } catch (error) {
        addNotification({
          title: '❌ Import Failed',
          message: 'Invalid file format',
          icon: '⚠️',
          type: 'error'
        });
      }
      setLoading(false);
    };

    reader.readAsArrayBuffer(file);
  };

  // Подтверждение импорта
  const confirmImport = () => {
    if (!importData || importData.length === 0) return;

    try {
      // Преобразуем импортированные данные в формат CRM
      const newCustomers = importData.map((item, index) => ({
        id: Date.now() + index,
        name: item.Name || item.name || '',
        email: item.Email || item.email || '',
        phone: item.Phone || item.phone || '',
        company: item.Company || item.company || '',
        status: item.Status || item.status || 'Lead',
        lastContact: new Date().toISOString().split('T')[0],
        deals: parseFloat(item.Deals || item.deals || item['Deals ($)'] || 0)
      })).filter(c => c.name && c.email); // Только с именем и email

      if (newCustomers.length === 0) {
        addNotification({
          title: '❌ Import Failed',
          message: 'No valid data found',
          icon: '⚠️',
          type: 'error'
        });
        return;
      }

      // Вызываем функцию импорта из родительского компонента
      onImport(newCustomers);
      
      addNotification({
        title: '📤 Import Successful',
        message: `${newCustomers.length} customers imported`,
        icon: '🎉',
        type: 'success'
      });

      // Закрываем модалку
      setShowModal(false);
      setImportData(null);
      setPreviewData([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error) {
      addNotification({
        title: '❌ Import Failed',
        message: error.message,
        icon: '⚠️',
        type: 'error'
      });
    }
  };

  return (
    <>
      <div className="export-import-buttons">
        <button 
          className="export-btn"
          onClick={exportToExcel}
          disabled={loading || customers.length === 0}
          title="Export to Excel"
        >
          📊 Excel
        </button>
        <button 
          className="export-btn"
          onClick={exportToCSV}
          disabled={loading || customers.length === 0}
          title="Export to CSV"
        >
          📄 CSV
        </button>
        <button 
          className="import-btn"
          onClick={() => setShowModal(true)}
          disabled={loading}
          title="Import from file"
        >
          📥 Import
        </button>
      </div>

      {/* Modal for Import */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal import-modal">
            <div className="modal-header">
              <h2>Import Customers</h2>
              <button className="close-btn" onClick={() => {
                setShowModal(false);
                setImportData(null);
                setPreviewData([]);
              }}>✕</button>
            </div>

            <div className="import-content">
              <div className="upload-area">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".xlsx,.xls,.csv"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="upload-label">
                  <span className="upload-icon">📂</span>
                  <span>Click to upload or drag and drop</span>
                  <span className="upload-hint">Supported: XLSX, XLS, CSV</span>
                </label>
              </div>

              {previewData.length > 0 && (
                <div className="preview-section">
                  <h3>Preview (first 5 rows)</h3>
                  <div className="preview-table">
                    <table>
                      <thead>
                        <tr>
                          {Object.keys(previewData[0]).map(key => (
                            <th key={key}>{key}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {previewData.map((row, idx) => (
                          <tr key={idx}>
                            {Object.values(row).map((val, i) => (
                              <td key={i}>{String(val).substring(0, 20)}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {importData && importData.length > 0 && (
                <div className="import-summary">
                  <p>Ready to import: <strong>{importData.length}</strong> records</p>
                </div>
              )}

              <div className="modal-actions">
                <button 
                  className="btn-secondary" 
                  onClick={() => {
                    setShowModal(false);
                    setImportData(null);
                    setPreviewData([]);
                  }}
                >
                  Cancel
                </button>
                <button 
                  className="btn-primary"
                  onClick={confirmImport}
                  disabled={!importData || importData.length === 0}
                >
                  Confirm Import
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExportImport;