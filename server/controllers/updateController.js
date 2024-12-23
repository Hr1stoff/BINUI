const express = require('express');
const router = express.Router();
const { createConnection } = require('../utils/dbConnection');
const authenticateToken = require('../middlewares/authenticateToken');
const { logChange } = require('../utils/logger');


// Изменение данных в таблице
router.patch('/changeRow', authenticateToken, async (req, res) => {
  const { host, user, password } = req.user;
  const { nameTable, editRow, oldRow } = req.body;

  if (!editRow) {
    return res.status(400).json({ message: 'Данные для изменения не указаны' });
  }

  let connection;

  try {
    connection = await createConnection({ host, user, password });

    switch (nameTable) {
      case 'access_rights': {
        const { department_id: departmentName, position_id: positionName } = editRow;
        const { user_type: userType } = editRow;
        const { openForSystem, closeForSystem } = editRow

        if (userType) {
          const query = `
          UPDATE access_rights
          SET user_type = ?
          WHERE department_id IN (
              SELECT id FROM departments WHERE name = ?
          )
          AND position_id IN (
              SELECT id FROM position WHERE name = ?
          );
        `;
          const values = [userType, departmentName, positionName];
          const [result] = await connection.query(query, values);

          if (result.affectedRows > 0) {
            await logChange(
              connection,
              nameTable,
              editRow.id,
              'UPDATE',
              { user_type: oldRow.user_type },
              { user_type: editRow.user_type }
            );
            res.status(200).json({ message: 'Запись обновлена' })
          } else {
            res.status(404).json({ message: 'Запись не найдена' });
          }
        }
        if (openForSystem && openForSystem.length > 0) {
          for (const system of openForSystem) {
            const query = `
              INSERT INTO access_rights (department_id, position_id, system_id, user_type)
              SELECT d.id, p.id, s.id, 
                     (SELECT ar.user_type
                      FROM access_rights ar
                      WHERE ar.department_id = d.id AND ar.position_id = p.id
                      LIMIT 1)
              FROM departments d
              JOIN position p ON p.name = ?
              JOIN systems s ON s.name = ?
              WHERE d.name = ?;
            `;
            const values = [positionName, system, departmentName];
            try {
              await connection.query(query, values);
              await logChange(
                connection,
                nameTable,
                null,
                'CREATE',
                null,
                { system: system, department_id: departmentName, position_id: positionName }
              );
            } catch (error) {
              console.error(`Ошибка при обработке openForSystem (${system}):`, error.message);
            }
          }
        }
        if (closeForSystem && closeForSystem.length > 0) {
          for (const system of closeForSystem) {
            const query = `
              DELETE FROM access_rights
              WHERE department_id = (
                  SELECT id FROM departments WHERE name = ?
              )
              AND position_id = (
                  SELECT id FROM position WHERE name = ?
              )
              AND system_id = (
                  SELECT id FROM systems WHERE name = ?
              );
            `;
            const values = [departmentName, positionName, system];
            try {
              await connection.query(query, values);
              await logChange(
                connection,
                nameTable,
                null,
                'DELETE',
                { system: system, department_id: departmentName, position_id: positionName },
                null
              );
            } catch (error) {
              console.error(`Ошибка при обработке closeForSystem (${system}):`, error.message);
            }
          }
        }
        res.status(200).json({ message: 'Данные успешно обновлены.' });
        break;
      }
      default:
        res.status(200).json({ message: 'Данные успешно обновлены.' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Ошибка сервера при обновлении данных.' });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
});

module.exports = router;
