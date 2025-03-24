/**
 * Arquivo de consultas SQL para o sistema de conferência de imobilizado
 */

// Consulta padrão para obter dados de imobilizado
const getImobilizadoQuery = `
WITH BaseData AS (
    SELECT 
        code       AS Código,
        name       AS Item,
        fa_char_1  AS Descrição,
        chart_name AS Categoria,
        section_name AS Local,
        id_entity,
        id_tag,
        id_chart
    FROM v_fixed_asset_iud
    WHERE id_entity = '474'
),
AcquisitionData AS (
    SELECT 
        id_tag, 
        value      AS Valor_Aquisicao, 
        datetime_0 AS AcqDate,
        id_chart  AS Acq_id_chart
    FROM Imobilizado_com_Erro_Contabil
    WHERE id_chart IN ('8036', '9393', '8040', '8042', '8041', '8045', '8049', '8051', '9388')
    
    UNION ALL
    
    SELECT 
        id_tag, 
        value      AS Valor_Aquisicao, 
        datetime_0 AS AcqDate,
        id_chart  AS Acq_id_chart
    FROM Old_document_item
    WHERE id_chart IN ('8036', '9393', '8040', '8042', '8041', '8045', '8049', '8051', '9388')
    
    UNION ALL
    
    SELECT 
        id_tag, 
        value      AS Valor_Aquisicao, 
        datetime_0 AS AcqDate,
        id_chart  AS Acq_id_chart
    FROM year_document_item
    WHERE id_chart IN ('8036', '9393', '8040', '8042', '8041', '8045', '8049', '8051', '9388')
),
RankedAcquisition AS (
    SELECT 
        ad.*,
        ROW_NUMBER() OVER (PARTITION BY ad.id_tag ORDER BY ad.AcqDate DESC) AS rn
    FROM AcquisitionData ad
)
SELECT
    b.Código as codigo,
    b.Item as item,
    b.Descrição as descricao,
    b.Categoria as categoria,
    b.Local as local,
    ISNULL(ra.Valor_Aquisicao, 0) AS valorAquisicao,
    CASE
        WHEN LEFT(COALESCE(ra.Acq_id_chart, b.id_chart), 4) = '8040' THEN 'Baixado'
        WHEN LEFT(COALESCE(ra.Acq_id_chart, b.id_chart), 4) = '8041' THEN 'Baixado'
        WHEN LEFT(COALESCE(ra.Acq_id_chart, b.id_chart), 4) = '8042' THEN 'Baixado'
        WHEN LEFT(COALESCE(ra.Acq_id_chart, b.id_chart), 4) = '8045' THEN 'Baixado'
        WHEN LEFT(COALESCE(ra.Acq_id_chart, b.id_chart), 4) = '8049' THEN 'Baixado'
        WHEN LEFT(COALESCE(ra.Acq_id_chart, b.id_chart), 4) = '8051' THEN 'Baixado'
        WHEN LEFT(COALESCE(ra.Acq_id_chart, b.id_chart), 4) = '9388' THEN 'Baixado'
        ELSE 'Ativo'
    END AS status,
    b.id_tag as id, -- Usado como ID para referência
    0 as confirmacao -- Campo padrão para confirmação, inicial como falso
FROM BaseData b
LEFT JOIN RankedAcquisition ra 
    ON b.id_tag = ra.id_tag 
    AND ra.rn = 1;
`;

// Consulta para atualizar a confirmação de um item
const updateConfirmacaoQuery = `
UPDATE TabelaConfirmacao
SET confirmacao = @confirmacao
WHERE id_tag = @id
`;

// Consulta para atualizar o local de um item
const updateLocalQuery = `
UPDATE TabelaLocalizacao
SET local = @local
WHERE id_tag = @id
`;

// Consulta simples para testar a conexão
const testConnectionQuery = `SELECT 1 as teste`;

// Exportar todas as consultas
module.exports = {
    getImobilizadoQuery,
    updateConfirmacaoQuery,
    updateLocalQuery,
    testConnectionQuery
}; 