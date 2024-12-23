const generationQuery = async (connection, tableName) => {
    if (tableName === 'access_rights') {
      const [systems] = await connection.query('SELECT name FROM systems');
  
      const systemColumns = systems
        .map(system => `MAX(CASE WHEN s.name = '${system.name}' THEN 1 ELSE 0 END) AS \`${system.name}\``)
        .join(', ');
  
      return `
        SELECT 
          MIN(ar.id) AS id,
          d.name AS department_id,
          p.name AS position_id,
          ar.user_type,
          ${systemColumns}
        FROM 
          access_rights ar
        JOIN 
          departments d ON ar.department_id = d.id
        JOIN 
          position p ON ar.position_id = p.id
        JOIN 
          systems s ON ar.system_id = s.id
        GROUP BY 
          d.name, p.name, ar.user_type
        ORDER BY 
          id ASC;
      `;
    } else {
      return `SELECT * FROM ${tableName};`;
    }
  };
  
  module.exports = { generationQuery };
  