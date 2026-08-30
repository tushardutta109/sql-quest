// SQL Quest Client-Side SQL Engine
const SQLEngine = (function() {
  
  // Local active database instance (cloned per session to allow safe DML)
  let activeDb = null;
  let tempViews = {};

  // Initialize DB instance
  function setDatabase(dbName) {
    if (typeof DATABASES !== 'undefined' && DATABASES[dbName]) {
      activeDb = JSON.parse(JSON.stringify(DATABASES[dbName])); // Deep copy
    } else {
      activeDb = {};
    }
    tempViews = {};
  }

  // Helper: Deep copy object
  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  // Parse conditional WHERE operations
  function evaluateCondition(row, condition, tableAliasMap) {
    if (!condition) return true;
    
    // Normalize condition string
    let cond = condition.trim();

    // Check for logical operators AND / OR (very basic splitting)
    if (/\s+AND\s+/i.test(cond)) {
      const parts = splitByLogicalOperator(cond, 'AND');
      return parts.every(part => evaluateCondition(row, part, tableAliasMap));
    }
    if (/\s+OR\s+/i.test(cond)) {
      const parts = splitByLogicalOperator(cond, 'OR');
      return parts.some(part => evaluateCondition(row, part, tableAliasMap));
    }

    // Handle NOT
    if (/^NOT\s+/i.test(cond)) {
      const sub = cond.replace(/^NOT\s+/i, '');
      return !evaluateCondition(row, sub, tableAliasMap);
    }

    // Resolve column value
    // Support operators: =, !=, <>, >, <, >=, <=, LIKE, BETWEEN, IN, IS NULL, IS NOT NULL
    let match;

    // 1. IS NULL / IS NOT NULL
    if ((match = cond.match(/^(.+?)\s+IS\s+NOT\s+NULL$/i))) {
      const val = getRowValue(row, match[1].trim(), tableAliasMap);
      return val !== null && val !== undefined;
    }
    if ((match = cond.match(/^(.+?)\s+IS\s+NULL$/i))) {
      const val = getRowValue(row, match[1].trim(), tableAliasMap);
      return val === null || val === undefined;
    }

    // 2. BETWEEN
    if ((match = cond.match(/^(.+?)\s+BETWEEN\s+(.+?)\s+AND\s+(.+?)$/i))) {
      const val = getRowValue(row, match[1].trim(), tableAliasMap);
      const low = parseLiteral(match[2].trim());
      const high = parseLiteral(match[3].trim());
      return val >= low && val <= high;
    }

    // 3. IN
    if ((match = cond.match(/^(.+?)\s+IN\s*\((.+?)\)$/i))) {
      const val = getRowValue(row, match[1].trim(), tableAliasMap);
      const list = match[2].split(',').map(s => parseLiteral(s.trim()));
      return list.includes(val);
    }

    // 4. LIKE
    if ((match = cond.match(/^(.+?)\s+LIKE\s+(.+?)$/i))) {
      const val = String(getRowValue(row, match[1].trim(), tableAliasMap) || '');
      const pattern = parseLiteral(match[2].trim());
      // Convert SQL LIKE pattern to Regex
      // % -> .*, _ -> .
      const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&');
      const regexStr = '^' + escaped.replace(/%/g, '.*').replace(/_/g, '.') + '$';
      const regex = new RegExp(regexStr, 'i');
      return regex.test(val);
    }

    // 5. Standard comparison operators: =, !=, <>, >=, <=, >, <
    const operators = [
      { sql: '!=', js: (a, b) => a != b },
      { sql: '<>', js: (a, b) => a != b },
      { sql: '>=', js: (a, b) => a >= b },
      { sql: '<=', js: (a, b) => a <= b },
      { sql: '=',  js: (a, b) => a == b },
      { sql: '>',  js: (a, b) => a > b },
      { sql: '<',  js: (a, b) => a < b }
    ];

    for (const op of operators) {
      const idx = cond.indexOf(op.sql);
      if (idx !== -1) {
        const colStr = cond.substring(0, idx).trim();
        const valStr = cond.substring(idx + op.sql.length).trim();
        const valA = getRowValue(row, colStr, tableAliasMap);
        const valB = parseLiteral(valStr);
        return op.js(valA, valB);
      }
    }

    return true;
  }

  // Split conditions by logic tokens, handling parenthesis/quotes optionally
  function splitByLogicalOperator(str, op) {
    const regex = new RegExp(`\\s+${op}\\s+`, 'i');
    return str.split(regex);
  }

  // Get value from row, supporting alias prefixes
  function getRowValue(row, columnExpr, tableAliasMap = {}) {
    let col = columnExpr.trim();

    // Handle standard functions: UPPER, LOWER, LENGTH, SUBSTR, etc.
    let funcMatch;
    if ((funcMatch = col.match(/^UPPER\((.+?)\)$/i))) {
      return String(getRowValue(row, funcMatch[1], tableAliasMap)).toUpperCase();
    }
    if ((funcMatch = col.match(/^LOWER\((.+?)\)$/i))) {
      return String(getRowValue(row, funcMatch[1], tableAliasMap)).toLowerCase();
    }
    if ((funcMatch = col.match(/^LENGTH\((.+?)\)$/i))) {
      return String(getRowValue(row, funcMatch[1], tableAliasMap)).length;
    }
    if ((funcMatch = col.match(/^SUBSTR\((.+?),\s*(\d+)(?:,\s*(\d+))?\)$/i))) {
      const val = String(getRowValue(row, funcMatch[1], tableAliasMap));
      const start = parseInt(funcMatch[2]) - 1; // SQL is 1-indexed
      const len = funcMatch[3] ? parseInt(funcMatch[3]) : undefined;
      return val.substring(start, len ? start + len : undefined);
    }
    if ((funcMatch = col.match(/^TRIM\((.+?)\)$/i))) {
      return String(getRowValue(row, funcMatch[1], tableAliasMap)).trim();
    }
    if ((funcMatch = col.match(/^ROUND\((.+?)(?:,\s*(\d+))?\)$/i))) {
      const val = parseFloat(getRowValue(row, funcMatch[1], tableAliasMap));
      const decimals = funcMatch[2] ? parseInt(funcMatch[2]) : 0;
      return isNaN(val) ? 0 : Number(val.toFixed(decimals));
    }
    if ((funcMatch = col.match(/^TRUNC\((.+?)(?:,\s*(\d+))?\)$/i))) {
      const val = parseFloat(getRowValue(row, funcMatch[1], tableAliasMap));
      const decimals = funcMatch[2] ? parseInt(funcMatch[2]) : 0;
      const factor = Math.pow(10, decimals);
      return isNaN(val) ? 0 : Math.trunc(val * factor) / factor;
    }
    if ((funcMatch = col.match(/^ABS\((.+?)\)$/i))) {
      return Math.abs(parseFloat(getRowValue(row, funcMatch[1], tableAliasMap)));
    }
    if ((funcMatch = col.match(/^CEIL\((.+?)\)$/i))) {
      return Math.ceil(parseFloat(getRowValue(row, funcMatch[1], tableAliasMap)));
    }
    if ((funcMatch = col.match(/^FLOOR\((.+?)\)$/i))) {
      return Math.floor(parseFloat(getRowValue(row, funcMatch[1], tableAliasMap)));
    }
    if ((funcMatch = col.match(/^MOD\((.+?),\s*(.+?)\)$/i))) {
      const a = parseFloat(getRowValue(row, funcMatch[1], tableAliasMap));
      const b = parseFloat(getRowValue(row, funcMatch[2], tableAliasMap));
      return a % b;
    }

    // Oracle dates: SYSDATE, CURRENT_DATE
    if (col.toUpperCase() === 'SYSDATE' || col.toUpperCase() === 'CURRENT_DATE') {
      return new Date().toISOString().split('T')[0];
    }
    if ((funcMatch = col.match(/^MONTHS_BETWEEN\((.+?),\s*(.+?)\)$/i))) {
      const d1 = new Date(getRowValue(row, funcMatch[1], tableAliasMap));
      const d2 = new Date(getRowValue(row, funcMatch[2], tableAliasMap));
      const diff = (d1.getFullYear() - d2.getFullYear()) * 12 + (d1.getMonth() - d2.getMonth());
      return Number(diff.toFixed(2));
    }
    if ((funcMatch = col.match(/^ADD_MONTHS\((.+?),\s*(.+?)\)$/i))) {
      const date = new Date(getRowValue(row, funcMatch[1], tableAliasMap));
      const months = parseInt(funcMatch[2]);
      date.setMonth(date.getMonth() + months);
      return date.toISOString().split('T')[0];
    }
    if ((funcMatch = col.match(/^LAST_DAY\((.+?)\)$/i))) {
      const date = new Date(getRowValue(row, funcMatch[1], tableAliasMap));
      const last = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      return last.toISOString().split('T')[0];
    }

    // Handle CASE WHEN ... THEN ... ELSE ... END
    if (/^CASE\s+/i.test(col)) {
      return evaluateCaseExpression(row, col, tableAliasMap);
    }

    // Resolve column aliases
    let parts = col.split('.');
    if (parts.length > 1) {
      let alias = parts[0].trim();
      let actualCol = parts[1].trim();
      return row[`${alias}.${actualCol}`] !== undefined ? row[`${alias}.${actualCol}`] : row[actualCol];
    }

    return row[col] !== undefined ? row[col] : null;
  }

  // CASE WHEN parser
  function evaluateCaseExpression(row, caseStr, tableAliasMap) {
    const cleanCase = caseStr.replace(/\s+/g, ' ');
    // Extract conditions
    const whenRegex = /WHEN\s+(.+?)\s+THEN\s+(.+?)(?=\s+WHEN|\s+ELSE|\s+END)/ig;
    let match;
    while ((match = whenRegex.exec(cleanCase)) !== null) {
      const cond = match[1].trim();
      const valStr = match[2].trim();
      if (evaluateCondition(row, cond, tableAliasMap)) {
        return parseLiteral(valStr);
      }
    }
    const elseMatch = cleanCase.match(/ELSE\s+(.+?)\s+END/i);
    if (elseMatch) {
      return parseLiteral(elseMatch[1].trim());
    }
    return null;
  }

  // Parse literals (strings with quotes, numbers, nulls)
  function parseLiteral(str) {
    if (!str) return null;
    str = str.trim();
    if (str.toUpperCase() === 'NULL') return null;
    if ((str.startsWith("'") && str.endsWith("'")) || (str.startsWith('"') && str.endsWith('"'))) {
      return str.slice(1, -1);
    }
    if (!isNaN(Number(str))) return Number(str);
    return str; // return as-is
  }

  // Helper: Split clauses by keywords, safely ignoring inside parentheses and quotes
  function extractClauses(query) {
    const keywords = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'FETCH FIRST'];
    const clauses = {};
    
    let upperQuery = query.toUpperCase();
    let currentKeyword = null;
    let lastIndex = 0;

    // Use regular expressions for keyword index positions (avoid inside strings)
    const matches = [];
    keywords.forEach(keyword => {
      let idx = 0;
      while ((idx = upperQuery.indexOf(keyword, idx)) !== -1) {
        // Verify keyword bounds
        const before = idx === 0 ? ' ' : upperQuery[idx - 1];
        const after = upperQuery[idx + keyword.length] || ' ';
        if (/\s/.test(before) && /\s/.test(after)) {
          matches.push({ keyword, index: idx });
        }
        idx += keyword.length;
      }
    });

    // Sort matches by index
    matches.sort((a, b) => a.index - b.index);

    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      if (currentKeyword) {
        clauses[currentKeyword] = query.substring(lastIndex, match.index).trim();
      }
      currentKeyword = match.keyword;
      lastIndex = match.index + match.keyword.length;
    }

    if (currentKeyword) {
      clauses[currentKeyword] = query.substring(lastIndex).trim();
    }

    return clauses;
  }

  // Execute SELECT query
  function runSelect(query) {
    // 1. Check CTE first
    if (/^WITH\s+/i.test(query.trim())) {
      return runCte(query);
    }

    // 2. Check Set operations: UNION, UNION ALL, INTERSECT, MINUS
    const setOpRegex = /\s+(UNION\s+ALL|UNION|INTERSECT|MINUS)\s+/i;
    if (setOpRegex.test(query)) {
      return runSetOperation(query, setOpRegex);
    }

    const clauses = extractClauses(query);
    if (!clauses['SELECT'] || !clauses['FROM']) {
      return { success: false, error: "Syntax Error: Queries must contain SELECT and FROM clauses" };
    }

    // Retrieve FROM source
    let fromSource = clauses['FROM'].trim();
    let dataset = [];
    let tableAliasMap = {};

    // Handle JOINS
    if (/\s+JOIN\s+/i.test(fromSource)) {
      const joinResult = executeJoins(fromSource);
      if (!joinResult.success) return joinResult;
      dataset = joinResult.data;
      tableAliasMap = joinResult.aliasMap;
    } else {
      // Single table
      const tableMatch = fromSource.match(/^([a-zA-Z0-9_]+)(?:\s+AS\s+)?(?:\s+([a-zA-Z0-9_]+))?$/i);
      if (!tableMatch) {
        return { success: false, error: `Invalid FROM clause: ${fromSource}` };
      }
      const tableName = tableMatch[1].toLowerCase();
      const alias = tableMatch[2] ? tableMatch[2] : null;

      const sourceTable = activeDb[tableName] || tempViews[tableName];
      if (!sourceTable) {
        return { success: false, error: `Table or View not found: ${tableName}` };
      }

      dataset = clone(sourceTable).map(row => {
        const mappedRow = {};
        for (const col in row) {
          mappedRow[col] = row[col];
          if (alias) {
            mappedRow[`${alias}.${col}`] = row[col];
          }
        }
        return mappedRow;
      });

      if (alias) {
        tableAliasMap[alias] = tableName;
      }
    }

    // 3. WHERE filtering
    if (clauses['WHERE']) {
      // Check subqueries in WHERE
      const subqueryMatch = clauses['WHERE'].match(/\((SELECT\s+.+?)\)/i);
      if (subqueryMatch) {
        const subResult = runSelect(subqueryMatch[1]);
        if (!subResult.success) return subResult;
        
        // Single value or list
        const valList = subResult.rows.map(r => r[subResult.columns[0]]);
        const replacement = valList.length === 1 ? parseLiteralValue(valList[0]) : `(${valList.map(v => parseLiteralValue(v)).join(',')})`;
        clauses['WHERE'] = clauses['WHERE'].replace(subqueryMatch[0], replacement);
      }
      
      dataset = dataset.filter(row => evaluateCondition(row, clauses['WHERE'], tableAliasMap));
    }

    // 4. GROUP BY / HAVING aggregation
    let isGrouped = false;
    let groupKeys = [];
    if (clauses['GROUP BY']) {
      isGrouped = true;
      groupKeys = clauses['GROUP BY'].split(',').map(s => s.trim());
      dataset = executeGroupBy(dataset, groupKeys, clauses['SELECT'], tableAliasMap);

      if (clauses['HAVING']) {
        dataset = dataset.filter(row => evaluateCondition(row, clauses['HAVING'], tableAliasMap));
      }
    }

    // 5. Window / Analytic Functions
    // If SELECT contains OVER, we process window functions here
    if (/\s+OVER\s*\(/i.test(clauses['SELECT'])) {
      dataset = executeWindowFunctions(dataset, clauses['SELECT'], tableAliasMap);
    }

    // 6. ORDER BY sorting
    if (clauses['ORDER BY']) {
      const sortExprs = clauses['ORDER BY'].split(',').map(s => s.trim());
      dataset.sort((a, b) => {
        for (const expr of sortExprs) {
          const match = expr.match(/^(.+?)(?:\s+(ASC|DESC))?$/i);
          const col = match[1].trim();
          const desc = match[2] && match[2].toUpperCase() === 'DESC';
          const valA = getRowValue(a, col, tableAliasMap);
          const valB = getRowValue(b, col, tableAliasMap);

          if (valA !== valB) {
            if (valA === null) return 1;
            if (valB === null) return -1;
            if (typeof valA === 'number' && typeof valB === 'number') {
              return desc ? valB - valA : valA - valB;
            }
            return desc ? String(valB).localeCompare(String(valA)) : String(valA).localeCompare(String(valB));
          }
        }
        return 0;
      });
    }

    // 7. FETCH FIRST limit
    if (clauses['FETCH FIRST']) {
      const match = clauses['FETCH FIRST'].match(/(\d+)\s+ROWS?\s+ONLY/i);
      if (match) {
        const count = parseInt(match[1]);
        dataset = dataset.slice(0, count);
      }
    }

    // 8. Projection (Select specific columns)
    const selectExprs = clauses['SELECT'].trim();
    const finalColumns = [];
    const finalRows = [];
    const isDistinct = /^DISTINCT\s+/i.test(selectExprs);
    const cleanExprs = selectExprs.replace(/^DISTINCT\s+/i, '');

    if (cleanExprs === '*') {
      // Get all columns from first row
      if (dataset.length > 0) {
        // Exclude alias columns containing dot
        Object.keys(dataset[0]).forEach(col => {
          if (!col.includes('.')) finalColumns.push(col);
        });
      }
    } else {
      // Split columns by comma (ignoring commas inside parentheses)
      const cols = splitColumns(cleanExprs);
      cols.forEach(col => {
        let alias = null;
        let expr = col.trim();
        const aliasMatch = expr.match(/^(.+?)\s+AS\s+(.+?)$/i) || expr.match(/^(.+?)\s+([a-zA-Z0-9_]+)$/i);
        if (aliasMatch) {
          expr = aliasMatch[1].trim();
          alias = aliasMatch[2].trim().replace(/['"]/g, '');
        }
        finalColumns.push(alias || expr);
      });
    }

    dataset.forEach(row => {
      const projected = {};
      if (cleanExprs === '*') {
        finalColumns.forEach(col => {
          projected[col] = row[col];
        });
      } else {
        const cols = splitColumns(cleanExprs);
        cols.forEach((col, idx) => {
          let expr = col.trim();
          const aliasMatch = expr.match(/^(.+?)\s+AS\s+(.+?)$/i) || expr.match(/^(.+?)\s+([a-zA-Z0-9_]+)$/i);
          if (aliasMatch) {
            expr = aliasMatch[1].trim();
          }
          const colName = finalColumns[idx];
          projected[colName] = getRowValue(row, expr, tableAliasMap);
        });
      }
      finalRows.push(projected);
    });

    let resultRows = finalRows;
    if (isDistinct) {
      // Remove duplicates
      const seen = new Set();
      resultRows = finalRows.filter(row => {
        const key = JSON.stringify(row);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    return {
      success: true,
      columns: finalColumns,
      rows: resultRows
    };
  }

  // Format JS literal values to SQL-friendly strings for substitution
  function parseLiteralValue(v) {
    if (v === null || v === undefined) return 'NULL';
    if (typeof v === 'number') return String(v);
    return `'${String(v).replace(/'/g, "''")}'`;
  }

  // Parse comma-separated column select list, ignoring commas in parenthesis
  function splitColumns(str) {
    const columns = [];
    let current = "";
    let parenCount = 0;
    let quote = false;

    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char === "'" && str[i-1] !== "\\") quote = !quote;
      if (!quote) {
        if (char === '(') parenCount++;
        else if (char === ')') parenCount--;
      }

      if (char === ',' && parenCount === 0 && !quote) {
        columns.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    if (current.trim()) {
      columns.push(current.trim());
    }
    return columns;
  }

  // Process JOINS
  function executeJoins(fromSource) {
    // Regex matching: table1 alias1 JOIN table2 alias2 ON t1.id = t2.id [JOIN table3 ...]
    // Parse tables and join conditions sequentially
    const tokens = tokenizeJoinString(fromSource);
    let aliasMap = {};
    let data = [];

    // Initialize with first table
    const firstTable = tokens[0];
    const sourceTable = activeDb[firstTable.name] || tempViews[firstTable.name];
    if (!sourceTable) {
      return { success: false, error: `Table not found: ${firstTable.name}` };
    }

    data = clone(sourceTable).map(row => {
      const r = {};
      for (const k in row) {
        r[k] = row[k];
        if (firstTable.alias) {
          r[`${firstTable.alias}.${k}`] = row[k];
        }
      }
      return r;
    });

    if (firstTable.alias) aliasMap[firstTable.alias] = firstTable.name;

    // Apply subsequent joins
    for (let i = 1; i < tokens.length; i++) {
      const join = tokens[i];
      const targetTable = activeDb[join.name] || tempViews[join.name];
      if (!targetTable) {
        return { success: false, error: `Table not found: ${join.name}` };
      }
      if (join.alias) aliasMap[join.alias] = join.name;

      const targetClones = clone(targetTable);
      let joinedData = [];

      data.forEach(leftRow => {
        let matchFound = false;

        targetClones.forEach(rightRow => {
          // Construct composite row for testing ON condition
          const testRow = Object.assign({}, leftRow);
          for (const k in rightRow) {
            testRow[k] = rightRow[k];
            if (join.alias) {
              testRow[`${join.alias}.${k}`] = rightRow[k];
            }
          }

          if (evaluateCondition(testRow, join.onCondition, aliasMap)) {
            matchFound = true;
            joinedData.push(testRow);
          }
        });

        // Handle OUTER JOINS (LEFT, FULL)
        if (!matchFound && (join.type === 'LEFT' || join.type === 'FULL')) {
          const emptyRightRow = {};
          // Fill right columns with NULL
          if (targetClones.length > 0) {
            Object.keys(targetClones[0]).forEach(k => {
              emptyRightRow[k] = null;
              if (join.alias) {
                emptyRightRow[`${join.alias}.${k}`] = null;
              }
            });
          }
          joinedData.push(Object.assign({}, leftRow, emptyRightRow));
        }
      });

      // Handle RIGHT / FULL joins (add unmatched right rows)
      if (join.type === 'RIGHT' || join.type === 'FULL') {
        targetClones.forEach(rightRow => {
          let rightMatchFound = false;
          
          data.forEach(leftRow => {
            const testRow = Object.assign({}, leftRow);
            for (const k in rightRow) {
              testRow[k] = rightRow[k];
              if (join.alias) {
                testRow[`${join.alias}.${k}`] = rightRow[k];
              }
            }
            if (evaluateCondition(testRow, join.onCondition, aliasMap)) {
              rightMatchFound = true;
            }
          });

          if (!rightMatchFound) {
            const emptyLeftRow = {};
            if (data.length > 0) {
              Object.keys(data[0]).forEach(k => {
                if (k.indexOf('.') !== -1) emptyLeftRow[k] = null;
              });
            }
            const composite = Object.assign({}, emptyLeftRow);
            for (const k in rightRow) {
              composite[k] = rightRow[k];
              if (join.alias) {
                composite[`${join.alias}.${k}`] = rightRow[k];
              }
            }
            joinedData.push(composite);
          }
        });
      }

      data = joinedData;
    }

    return { success: true, data, aliasMap };
  }

  // Tokenize the FROM statement into tables and joins
  function tokenizeJoinString(str) {
    // Splits by INNER JOIN, LEFT JOIN, RIGHT JOIN, FULL OUTER JOIN, etc.
    const parts = str.split(/\s+(?:INNER\s+|LEFT\s+|RIGHT\s+|FULL\s+)?JOIN\s+/i);
    const tokens = [];

    // Parse first table
    const firstTableMatch = parts[0].trim().match(/^([a-zA-Z0-9_]+)(?:\s+AS\s+)?(?:\s+([a-zA-Z0-9_]+))?$/i);
    tokens.push({
      name: firstTableMatch[1].toLowerCase(),
      alias: firstTableMatch[2] ? firstTableMatch[2] : null,
      type: 'FIRST'
    });

    // Parse subsequent joins
    let joinTypes = [];
    const typeRegex = /(INNER|LEFT|RIGHT|FULL)\s+JOIN/ig;
    let typeMatch;
    while ((typeMatch = typeRegex.exec(str)) !== null) {
      joinTypes.push(typeMatch[1].toUpperCase());
    }

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i].trim();
      // Match table name, alias, ON condition
      const onIndex = part.toUpperCase().indexOf('ON ');
      if (onIndex === -1) continue;

      const tablePart = part.substring(0, onIndex).trim();
      const conditionPart = part.substring(onIndex + 3).trim();

      const tableMatch = tablePart.match(/^([a-zA-Z0-9_]+)(?:\s+AS\s+)?(?:\s+([a-zA-Z0-9_]+))?$/i);
      const name = tableMatch[1].toLowerCase();
      const alias = tableMatch[2] ? tableMatch[2] : null;

      tokens.push({
        name,
        alias,
        type: joinTypes[i - 1] || 'INNER',
        onCondition: conditionPart
      });
    }

    return tokens;
  }

  // Execute GROUP BY logic and aggregate functions
  function executeGroupBy(dataset, groupKeys, selectExprs, aliasMap) {
    const grouped = {};
    const cols = splitColumns(selectExprs.replace(/^DISTINCT\s+/i, ''));
    
    // Find aggregate expressions: COUNT, SUM, AVG, MIN, MAX
    const aggExprs = [];
    cols.forEach(col => {
      let expr = col.trim();
      const aliasMatch = expr.match(/^(.+?)\s+AS\s+(.+?)$/i) || expr.match(/^(.+?)\s+([a-zA-Z0-9_]+)$/i);
      if (aliasMatch) {
        expr = aliasMatch[1].trim();
      }
      if (/(COUNT|SUM|AVG|MIN|MAX)\((.+?)\)/i.test(expr)) {
        const match = expr.match(/(COUNT|SUM|AVG|MIN|MAX)\((.+?)\)/i);
        aggExprs.push({
          full: expr,
          func: match[1].toUpperCase(),
          arg: match[2].trim()
        });
      }
    });

    dataset.forEach(row => {
      // Calculate group key values
      const keyVal = groupKeys.map(k => getRowValue(row, k, aliasMap)).join('||');
      if (!grouped[keyVal]) {
        grouped[keyVal] = {
          rows: [],
          keyVals: groupKeys.reduce((acc, k) => {
            acc[k] = getRowValue(row, k, aliasMap);
            return acc;
          }, {})
        };
      }
      grouped[keyVal].rows.push(row);
    });

    // Generate output dataset
    const result = [];
    Object.keys(grouped).forEach(k => {
      const grp = grouped[k];
      const summaryRow = Object.assign({}, grp.keyVals);

      aggExprs.forEach(agg => {
        const values = grp.rows.map(r => getRowValue(r, agg.arg, aliasMap)).filter(v => v !== null && v !== undefined);
        let aggVal = 0;
        
        switch (agg.func) {
          case 'COUNT':
            aggVal = agg.arg === '*' ? grp.rows.length : values.length;
            break;
          case 'SUM':
            aggVal = values.reduce((sum, v) => sum + Number(v || 0), 0);
            break;
          case 'AVG':
            aggVal = values.length === 0 ? 0 : values.reduce((sum, v) => sum + Number(v || 0), 0) / values.length;
            aggVal = Number(aggVal.toFixed(2));
            break;
          case 'MIN':
            aggVal = values.length === 0 ? null : Math.min(...values.map(Number));
            break;
          case 'MAX':
            aggVal = values.length === 0 ? null : Math.max(...values.map(Number));
            break;
        }
        summaryRow[agg.full] = aggVal;
      });

      result.push(summaryRow);
    });

    return result;
  }

  // Process Window Functions
  function executeWindowFunctions(dataset, selectExprs, aliasMap) {
    const cols = splitColumns(selectExprs);
    
    cols.forEach(col => {
      let expr = col.trim();
      const aliasMatch = expr.match(/^(.+?)\s+AS\s+(.+?)$/i) || expr.match(/^(.+?)\s+([a-zA-Z0-9_]+)$/i);
      let alias = aliasMatch ? aliasMatch[2].trim() : null;
      let windowExpr = aliasMatch ? aliasMatch[1].trim() : expr;

      const overMatch = windowExpr.match(/(ROW_NUMBER|RANK|DENSE_RANK|LAG|LEAD|SUM|AVG|COUNT|MIN|MAX)\((.*?)\)\s+OVER\s*\((.*?)\)/i);
      if (!overMatch) return;

      const func = overMatch[1].toUpperCase();
      const arg = overMatch[2].trim();
      const overClause = overMatch[3].trim();

      // Parse Partition BY and ORDER BY within OVER
      let partitionBy = null;
      let orderBy = null;

      const partitionMatch = overClause.match(/PARTITION\s+BY\s+(.+?)(?=\s+ORDER\s+BY|$)/i);
      if (partitionMatch) partitionBy = partitionMatch[1].trim();

      const orderMatch = overClause.match(/ORDER\s+BY\s+(.+?)$/i);
      if (orderMatch) orderBy = orderMatch[1].trim();

      // Group by partition if any
      const partitions = {};
      dataset.forEach((row, originalIndex) => {
        row.__originalIndex = originalIndex;
        const key = partitionBy ? getRowValue(row, partitionBy, aliasMap) : 'ALL';
        if (!partitions[key]) partitions[key] = [];
        partitions[key].push(row);
      });

      // Process each partition
      Object.keys(partitions).forEach(pKey => {
        const rows = partitions[pKey];

        // Sort inside partition if ORDER BY is present
        if (orderBy) {
          const sortExprs = orderBy.split(',').map(s => s.trim());
          rows.sort((a, b) => {
            for (const expr of sortExprs) {
              const m = expr.match(/^(.+?)(?:\s+(ASC|DESC))?$/i);
              const col = m[1].trim();
              const desc = m[2] && m[2].toUpperCase() === 'DESC';
              const valA = getRowValue(a, col, aliasMap);
              const valB = getRowValue(b, col, aliasMap);

              if (valA !== valB) {
                if (valA === null) return 1;
                if (valB === null) return -1;
                return desc ? (valA > valB ? -1 : 1) : (valA > valB ? 1 : -1);
              }
            }
            return 0;
          });
        }

        // Apply functions
        let rank = 1;
        let denseRank = 1;
        let lastVal = null;

        rows.forEach((row, idx) => {
          let calculatedVal = null;

          if (func === 'ROW_NUMBER') {
            calculatedVal = idx + 1;
          } else if (func === 'RANK' || func === 'DENSE_RANK') {
            if (orderBy) {
              const currentVal = getRowValue(row, orderBy.split(',')[0].replace(/\s+(ASC|DESC)/i, ''), aliasMap);
              if (idx > 0 && currentVal !== lastVal) {
                denseRank++;
                rank = idx + 1;
              }
              lastVal = currentVal;
            }
            calculatedVal = func === 'RANK' ? rank : denseRank;
          } else if (func === 'LAG') {
            const offsetMatch = arg.match(/^(.+?)(?:\s*,\s*(\d+))?$/);
            const lagCol = offsetMatch[1].trim();
            const offset = offsetMatch[2] ? parseInt(offsetMatch[2]) : 1;
            calculatedVal = (idx - offset >= 0) ? getRowValue(rows[idx - offset], lagCol, aliasMap) : null;
          } else if (func === 'LEAD') {
            const offsetMatch = arg.match(/^(.+?)(?:\s*,\s*(\d+))?$/);
            const leadCol = offsetMatch[1].trim();
            const offset = offsetMatch[2] ? parseInt(offsetMatch[2]) : 1;
            calculatedVal = (idx + offset < rows.length) ? getRowValue(rows[idx + offset], leadCol, aliasMap) : null;
          } else if (func === 'SUM' && orderBy) {
            // Running Total
            let sum = 0;
            for (let k = 0; k <= idx; k++) {
              sum += Number(getRowValue(rows[k], arg, aliasMap) || 0);
            }
            calculatedVal = sum;
          }

          row[alias || windowExpr] = calculatedVal;
        });
      });

      // Restore original order
      dataset.sort((a, b) => a.__originalIndex - b.__originalIndex);
      dataset.forEach(row => delete row.__originalIndex);
    });

    return dataset;
  }

  // CTE Runner: WITH cte AS (subquery) SELECT ...
  function runCte(query) {
    const match = query.match(/^WITH\s+([a-zA-Z0-9_]+)\s+AS\s*\(\s*(SELECT\s+.+?)\s*\)\s*(SELECT\s+.+)$/i);
    if (!match) {
      return { success: false, error: "Syntax Error in CTE definition: Use WITH cte_name AS (SELECT ...) SELECT ..." };
    }
    const cteName = match[1].toLowerCase();
    const cteSubquery = match[2];
    const mainQuery = match[3];

    // Evaluate Subquery
    const subResult = runSelect(cteSubquery);
    if (!subResult.success) return subResult;

    // Register CTE as temp view
    tempViews[cteName] = subResult.rows;

    // Run Main query
    const mainResult = runSelect(mainQuery);
    
    // Cleanup
    delete tempViews[cteName];

    return mainResult;
  }

  // Set Operations: UNION, UNION ALL, INTERSECT, MINUS
  function runSetOperation(query, regex) {
    const match = query.match(new RegExp(`^(.+?)${regex.source}(.+?)$`, 'i'));
    if (!match) return { success: false, error: "Syntax Error in Set Operation" };

    const leftQuery = match[1].trim();
    const setOp = match[2].toUpperCase().trim();
    const rightQuery = match[3].trim();

    const leftResult = runSelect(leftQuery);
    if (!leftResult.success) return leftResult;

    const rightResult = runSelect(rightQuery);
    if (!rightResult.success) return rightResult;

    if (leftResult.columns.length !== rightResult.columns.length) {
      return { success: false, error: "Set operations require queries to yield the same number of columns" };
    }

    let rows = [];
    const leftRows = leftResult.rows;
    const rightRows = rightResult.rows;

    // Convert rows to normalized lists to compare
    const serialize = r => JSON.stringify(Object.values(r));

    if (setOp === 'UNION ALL') {
      rows = [...leftRows, ...rightRows];
    } else if (setOp === 'UNION') {
      const seen = new Set();
      leftRows.concat(rightRows).forEach(r => {
        const s = serialize(r);
        if (!seen.has(s)) {
          seen.add(s);
          rows.push(r);
        }
      });
    } else if (setOp === 'INTERSECT') {
      const rightSerialized = new Set(rightRows.map(serialize));
      const seen = new Set();
      leftRows.forEach(r => {
        const s = serialize(r);
        if (rightSerialized.has(s) && !seen.has(s)) {
          seen.add(s);
          rows.push(r);
        }
      });
    } else if (setOp === 'MINUS') {
      const rightSerialized = new Set(rightRows.map(serialize));
      const seen = new Set();
      leftRows.forEach(r => {
        const s = serialize(r);
        if (!rightSerialized.has(s) && !seen.has(s)) {
          seen.add(s);
          rows.push(r);
        }
      });
    }

    return {
      success: true,
      columns: leftResult.columns,
      rows: rows
    };
  }

  // Oracle Hierarchical Query evaluation: START WITH ... CONNECT BY PRIOR
  function runHierarchical(query) {
    // Matches START WITH condition CONNECT BY PRIOR child = parent
    const clauses = extractClauses(query);
    const fromSource = clauses['FROM'].trim();
    const sourceTable = activeDb[fromSource.toLowerCase()];
    if (!sourceTable) {
      return { success: false, error: `Table not found: ${fromSource}` };
    }

    const connectClause = clauses['SELECT'] + ' ' + (clauses['WHERE'] || '') + ' ' + query;
    const startMatch = connectClause.match(/START\s+WITH\s+(.+?)(?=\s+CONNECT\s+BY|$)/i);
    const connectMatch = connectClause.match(/CONNECT\s+BY\s+(?:PRIOR\s+)?([a-zA-Z0-9_]+)\s*=\s*(?:PRIOR\s+)?([a-zA-Z0-9_]+)/i);

    if (!startMatch || !connectMatch) {
      return { success: false, error: "Syntax Error in Hierarchical keywords: START WITH ... CONNECT BY PRIOR child = parent" };
    }

    const startCond = startMatch[1].trim();
    const keyLeft = connectMatch[1].trim();
    const keyRight = connectMatch[2].trim();

    // Determine prior side
    const isPriorLeft = /PRIOR\s+[a-zA-Z0-9_]+/i.test(connectMatch[0]);

    // Find root nodes
    const rootRows = clone(sourceTable).filter(row => evaluateCondition(row, startCond, {}));
    const resultRows = [];

    // Traverse recursively
    function traverse(node, depth) {
      resultRows.push(node);
      
      const parentVal = node[isPriorLeft ? keyLeft : keyRight];
      
      const children = clone(sourceTable).filter(row => {
        const childVal = row[isPriorLeft ? keyRight : keyLeft];
        return childVal === parentVal;
      });

      children.forEach(child => traverse(child, depth + 1));
    }

    rootRows.forEach(root => traverse(root, 1));

    return {
      success: true,
      columns: Object.keys(sourceTable[0]),
      rows: resultRows
    };
  }

  // CREATE VIEW ViewName AS SELECT ...
  function runCreateView(query) {
    const match = query.match(/^CREATE\s+(?:OR\s+REPLACE\s+)?VIEW\s+([a-zA-Z0-9_]+)\s+AS\s+(SELECT\s+.+)$/i);
    if (!match) return { success: false, error: "Syntax Error: Use CREATE VIEW view_name AS SELECT ..." };
    
    const viewName = match[1].toLowerCase();
    const viewSelect = match[2];

    const result = runSelect(viewSelect);
    if (!result.success) return result;

    // Persist View in global db copy
    activeDb[viewName] = result.rows;

    return {
      success: true,
      columns: ['result'],
      rows: [{ result: `View ${viewName.toUpperCase()} created.` }]
    };
  }

  // DML UPDATE
  function runUpdate(query) {
    const match = query.match(/^UPDATE\s+([a-zA-Z0-9_]+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+?))?$/i);
    if (!match) return { success: false, error: "Syntax Error: Use UPDATE table SET col = val WHERE condition;" };

    const tableName = match[1].toLowerCase();
    const setClause = match[2].trim();
    const whereClause = match[3] ? match[3].trim() : null;

    if (!activeDb[tableName]) return { success: false, error: `Table not found: ${tableName}` };

    // Parse set actions
    const updates = setClause.split(',').map(s => s.trim());
    let updatedCount = 0;

    activeDb[tableName].forEach(row => {
      if (!whereClause || evaluateCondition(row, whereClause, {})) {
        updates.forEach(up => {
          const parts = up.split('=');
          const col = parts[0].trim();
          const expr = parts[1].trim();

          // Evaluate expression (e.g., price = price + 20)
          let val = null;
          if (expr.includes('+')) {
            const math = expr.split('+');
            val = Number(row[math[0].trim()] || 0) + Number(parseLiteral(math[1].trim()));
          } else if (expr.includes('-')) {
            const math = expr.split('-');
            val = Number(row[math[0].trim()] || 0) - Number(parseLiteral(math[1].trim()));
          } else {
            val = parseLiteral(expr);
          }

          row[col] = val;
        });
        updatedCount++;
      }
    });

    return {
      success: true,
      columns: ['rows_affected'],
      rows: [{ rows_affected: updatedCount }]
    };
  }

  // Run a complete SQL string statement
  function execute(query, dbName) {
    try {
      setDatabase(dbName);
      
      const cleanQuery = query.trim().replace(/;+$/, '').replace(/\s+/g, ' ');

      // Determine Query Type
      if (/^CREATE\s+/i.test(cleanQuery)) {
        return runCreateView(cleanQuery);
      }
      if (/^UPDATE\s+/i.test(cleanQuery)) {
        return runUpdate(cleanQuery);
      }
      if (/CONNECT\s+BY\s+PRIOR/i.test(cleanQuery)) {
        return runHierarchical(cleanQuery);
      }
      if (/^WITH\s+/i.test(cleanQuery) || /^SELECT\s+/i.test(cleanQuery)) {
        return runSelect(cleanQuery);
      }

      // Exact match level-specific short answers (e.g. "INTO")
      if (cleanQuery.toUpperCase() === 'INTO') {
        return { success: true, columns: ['Answer'], rows: [{ Answer: 'INTO' }] };
      }

      return { success: false, error: "Unsupported SQL operation. SQL Quest supports SELECT, JOIN, CTEs, Window functions, Views, and simple updates." };
    } catch (e) {
      console.error(e);
      return { success: false, error: `Execution Error: ${e.message}` };
    }
  }

  // Validate answer by comparing columns/rows structure and contents
  function validateAnswer(userQuery, expectedQuery, dbName, requiredKeywords = [], interactiveType = "editor", selectedOption = null) {
    if (interactiveType === "multiple-choice") {
      // Just check if selected option matches expected solution
      const isCorrect = selectedOption === expectedQuery;
      return {
        isCorrect,
        userResult: isCorrect ? { columns: ['Result'], rows: [{ Result: 'Correct' }] } : { columns: ['Result'], rows: [{ Result: 'Incorrect' }] }
      };
    }

    // 1. Keyword Checklist
    const normalizedUser = userQuery.toLowerCase().replace(/\s+/g, ' ');
    for (const kw of requiredKeywords) {
      const kwLower = kw.toLowerCase();
      // Handle operators special cases
      if (kwLower === '*') {
        if (!normalizedUser.includes('*')) return { isCorrect: false, error: `Missing wildcard (*)` };
      } else {
        // Word boundary check for standard words
        const isWord = /^[a-z0-9_]+$/i.test(kwLower);
        const regex = isWord ? new RegExp(`\\b${kwLower}\\b`, 'i') : new RegExp(kwLower.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'), 'i');
        if (!regex.test(normalizedUser)) {
          return { isCorrect: false, error: `Your query must use the keyword/operator: ${kw.toUpperCase()}` };
        }
      }
    }

    // 2. Evaluate User query
    const userResult = execute(userQuery, dbName);
    if (!userResult.success) {
      return { isCorrect: false, error: userResult.error };
    }

    // 3. Evaluate Solution query
    const solutionResult = execute(expectedQuery, dbName);
    if (!solutionResult.success) {
      // Internal error in levels setup
      return { isCorrect: true, userResult }; 
    }

    // 4. Compare Result tables (columns & rows contents)
    const colsMatch = compareArrays(userResult.columns.map(c => c.toLowerCase()), solutionResult.columns.map(c => c.toLowerCase()));
    
    // Sort rows for order-independent comparison unless ORDER BY is specified
    const hasOrderBy = /ORDER\s+BY/i.test(expectedQuery);
    let uRows = clone(userResult.rows);
    let sRows = clone(solutionResult.rows);

    if (!hasOrderBy) {
      const sorter = (a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b));
      uRows.sort(sorter);
      sRows.sort(sorter);
    }

    const rowsMatch = compareRows(uRows, sRows);

    if (colsMatch && rowsMatch) {
      return { isCorrect: true, userResult };
    }

    return { 
      isCorrect: false, 
      error: "Query executed successfully, but results do not match the expected dataset. Try adjusting your columns or filter conditions.",
      userResult
    };
  }

  // Helper arrays compare
  function compareArrays(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  // Compare rows array containing objects
  function compareRows(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      const keysA = Object.keys(a[i]);
      const keysB = Object.keys(b[i]);
      if (keysA.length !== keysB.length) return false;

      // Match values regardless of column capitalization
      for (const k of keysA) {
        const canonicalKey = keysB.find(kb => kb.toLowerCase() === k.toLowerCase());
        if (!canonicalKey) return false;
        
        let valA = a[i][k];
        let valB = b[i][canonicalKey];

        // Format dates or floats for precision comparison
        if (typeof valA === 'number' && typeof valB === 'number') {
          if (Math.abs(valA - valB) > 0.01) return false;
        } else if (String(valA) !== String(valB)) {
          return false;
        }
      }
    }
    return true;
  }

  return {
    execute,
    validateAnswer
  };

})();

// Expose to window/global scope
if (typeof window !== 'undefined') {
  window.SQLEngine = SQLEngine;
}
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SQLEngine };
}
