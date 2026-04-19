// 获取所有日期对应的JSON文件名
const fileNames = [
    'daily_papers_2026-02-24.json',
    'daily_papers_2026-02-25.json',
    'daily_papers_2026-02-26.json',
    'daily_papers_2026-02-27.json',
    'daily_papers_2026-03-02.json',
    'daily_papers_2026-03-03.json',
    'daily_papers_2026-03-04.json',
    'daily_papers_2026-03-05.json',
    'daily_papers_2026-03-06.json',
    'daily_papers_2026-03-09.json',
    'daily_papers_2026-03-10.json',
    'daily_papers_2026-03-11.json',
    'daily_papers_2026-03-12.json',
    'daily_papers_2026-03-13.json',
    'daily_papers_2026-03-16.json',
    'daily_papers_2026-03-17.json',
    'daily_papers_2026-03-18.json',
    'daily_papers_2026-03-19.json',
    'daily_papers_2026-03-20.json',
    'daily_papers_2026-03-23.json',
    'daily_papers_2026-03-24.json',
    'daily_papers_2026-03-25.json',
    'daily_papers_2026-03-26.json',
    'daily_papers_2026-03-27.json',
    'daily_papers_2026-03-30.json',
    'daily_papers_2026-03-31.json',
    'daily_papers_2026-04-01.json',
    'daily_papers_2026-04-02.json',
    'daily_papers_2026-04-03.json',
    'daily_papers_2026-04-06.json',
    'daily_papers_2026-04-07.json',
    'daily_papers_2026-04-08.json',
    'daily_papers_2026-04-09.json',
    'daily_papers_2026-04-10.json',
    'daily_papers_2026-04-13.json',
    'daily_papers_2026-04-14.json',
    'daily_papers_2026-04-15.json',
    'daily_papers_2026-04-16.json',
    'daily_papers_2026-04-17.json',
];

// 全局变量
let allPapersData = [];
let processedData = {};
let chartInstance = null;
let categoryColors = {};
let selectedCategories = new Set(); // 选中的category
let allCategories = []; // 所有category列表
let periodStars = {}; // 每个周期的周期之星
let periodDays = 7; // 周期天数（1、7、30）
// 生成颜色
function generateColors(categories) {
    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe',
        '#43e97b', '#38f9d7', '#fa709a', '#fee140', '#30b0fe',
        '#ec008c', '#8ec5fc', '#ff6b35', '#f7931e', '#37b7c3'
    ];
    
    categories.forEach((cat, idx) => {
        if (!categoryColors[cat]) {
            categoryColors[cat] = colors[idx % colors.length];
        }
    });
}

// 从文件名提取日期
function getDateFromFileName(fileName) {
    const match = fileName.match(/daily_papers_(\d{4}-\d{2}-\d{2})/);
    return match ? new Date(match[1]) : null;
}

// 计算周期的起始日期
function getPeriod(date) {
    const baseDate = new Date('2026-02-23'); // 周一作为基准日期
    const daysElapsed = Math.floor((date - baseDate) / (1000 * 60 * 60 * 24));

    let periodNumber, periodStart, periodEnd;

    if (periodDays === 1) {
        // 1天模式：每天就是一个周期
        periodNumber = daysElapsed;
        periodStart = new Date(date);
        periodStart.setHours(0, 0, 0, 0);
        periodEnd = new Date(periodStart);
    } else if (periodDays === 7) {
        // 周模式：周一到周日为一个周期
        const currentDate = new Date(date);
        const dayOfWeek = currentDate.getDay(); // 0=周日, 1=周一, ..., 6=周六

        // 计算本周的周一（周一=1，如果是周日=0，则往前推6天）
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        periodStart = new Date(currentDate);
        periodStart.setDate(currentDate.getDate() + mondayOffset);
        periodStart.setHours(0, 0, 0, 0);

        // 本周的周日
        periodEnd = new Date(periodStart);
        periodEnd.setDate(periodStart.getDate() + 6);

        // 计算周期编号（从基准日期开始的周数）
        const weeksElapsed = Math.floor((periodStart - baseDate) / (1000 * 60 * 60 * 24 * 7));
        periodNumber = weeksElapsed;
    } else {
        // 多天模式（30天等）
        periodNumber = Math.floor(daysElapsed / periodDays);
        periodStart = new Date(baseDate);
        periodStart.setDate(periodStart.getDate() + periodNumber * periodDays);
        periodEnd = new Date(periodStart);
        periodEnd.setDate(periodEnd.getDate() + periodDays - 1);
    }

    return {
        periodNumber,
        start: periodStart,
        end: periodEnd,
        label: periodDays === 1 ?
            formatDate(periodStart) :
            `${formatDate(periodStart)} ~ ${formatDate(periodEnd)}`
    };
}

// 旧名称兼容
function get5DayPeriod(date) {
    return getPeriod(date);
}

// 格式化日期
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

// 加载并处理所有JSON文件
async function loadAllData() {
    showLoading(true);
    clearError();
    allPapersData = [];

    try {
        let loadedCount = 0;
        let errorCount = 0;

        for (const fileName of fileNames) {
            try {
                const response = await fetch(fileName);
                if (response.ok) {
                    const data = await response.json();
                    const date = getDateFromFileName(fileName);
                    
                    // 只取前3个论文
                    data.slice(0, 3).forEach((paper, idx) => {
                        allPapersData.push({
                            ...paper,
                            date: date,
                            sourceFile: fileName,
                            indexInFile: idx
                        });
                    });
                    loadedCount++;
                    console.log(`✓ 已加载: ${fileName} (${Math.min(data.length, 3)}篇论文)`);
                } else {
                    console.warn(`⚠ ${fileName}: HTTP ${response.status}`);
                    errorCount++;
                }
            } catch (err) {
                console.warn(`✗ 无法加载 ${fileName}:`, err.message);
                errorCount++;
            }
        }

        console.log(`\n📊 加载统计: ${loadedCount}个文件成功, ${errorCount}个文件失败`);
        console.log(`📝 总计加载: ${allPapersData.length}篇论文`);

        if (allPapersData.length === 0) {
            throw new Error(`未成功加载任何数据文件。已尝试${fileNames.length}个文件，其中${loadedCount}个成功。请检查：
1. 确保JSON文件与HTML在同一目录
2. 通过本地服务器访问（http://localhost:8000）而不是file://
3. 查看浏览器控制台（F12）查看详细错误信息`);
        }

        processData();
        updateUI();
        showLoading(false);
        console.log('✅ 数据加载和处理完成');
    } catch (error) {
        showError(`数据加载失败: ${error.message}`);
        showLoading(false);
        console.error('详细错误:', error);
    }
}

// 处理数据：按周期和category分组
function processData() {
    processedData = {};
    periodStars = {};
    allCategories = [];

    allPapersData.forEach(paper => {
        if (!paper.date || !paper.category) return;

        const period = getPeriod(paper.date);
        const key = period.label;

        if (!processedData[key]) {
            processedData[key] = {
                label: key,
                startDate: period.start,
                periodNumber: period.periodNumber,
                categories: {},
                allPapers: []
            };
        }

        if (!processedData[key].categories[paper.category]) {
            processedData[key].categories[paper.category] = {
                papers: [],
                totalUpvotes: 0,
                count: 0
            };
        }

        processedData[key].categories[paper.category].papers.push(paper);
        processedData[key].categories[paper.category].totalUpvotes += paper.upvotes || 0;
        processedData[key].categories[paper.category].count += 1;
        processedData[key].allPapers.push(paper);

        // 收集所有category
        if (!allCategories.includes(paper.category)) {
            allCategories.push(paper.category);
        }
    });

    // 计算每个周期的周期之星（upvotes最高的论文）
    Object.keys(processedData).forEach(key => {
        const period = processedData[key];
        let maxUpvotesPaper = null;
        let maxUpvotes = -1;

        period.allPapers.forEach(paper => {
            if (paper.upvotes > maxUpvotes) {
                maxUpvotes = paper.upvotes;
                maxUpvotesPaper = paper;
            }
        });

        if (maxUpvotesPaper) {
            periodStars[key] = maxUpvotesPaper;
        }
    });

    // 排序category按字母
    allCategories.sort();

    // 初始化selectedCategories为前10个category
    selectedCategories.clear();
    allCategories.slice(0, 10).forEach(cat => selectedCategories.add(cat));

    // 排序周期
    Object.keys(processedData).sort((a, b) => {
        return processedData[a].periodNumber - processedData[b].periodNumber;
    });
}

// 基于聚合方式获取类别数据
function getCategoryMetrics(category, aggregationType) {
    let totalValue = 0;

    Object.keys(processedData).forEach(periodKey => {
        const categories = processedData[periodKey].categories;
        if (categories[category]) {
            const data = categories[category];
            if (aggregationType === 'sum') {
                totalValue += data.totalUpvotes;
            } else if (aggregationType === 'avg') {
                totalValue += data.count > 0 ? data.totalUpvotes / data.count : 0;
            } else if (aggregationType === 'count') {
                totalValue += data.count;
            }
        }
    });

    return totalValue;
}

// 更新UI
function updateUI() {
    const aggregationType = document.getElementById('aggregationType').value;
    const topN = parseInt(document.getElementById('topN').value) || 10;

    // 获取选中的category (如果没有选择，就用前topN个)
    let topCategories;
    if (selectedCategories.size > 0) {
        topCategories = Array.from(selectedCategories);
    } else {
        // 备选方案：按总值排序获取前N个
        topCategories = Array.from(allCategories)
            .map(cat => ({
                category: cat,
                value: getCategoryMetrics(cat, aggregationType)
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, topN)
            .map(item => item.category);
    }

    generateColors(topCategories);

    // 更新统计信息
    updateStats(topCategories, aggregationType);

    // 生成图表数据
    const chartData = generateChartData(topCategories, aggregationType);
    drawChart(chartData);

    // 生成图例
    generateLegend(topCategories);

    // 生成详细信息
    generateDetails(topCategories, aggregationType);

    // 生成Category选择器
    generateCategorySelector();

    document.getElementById('content').style.display = 'block';
}

// 更新统计卡片
function updateStats(topCategories, aggregationType) {
    let totalPapers = allPapersData.length;
    let totalUpvotes = allPapersData.reduce((sum, paper) => sum + (paper.upvotes || 0), 0);
    let uniqueCategories = new Set(allPapersData.map(p => p.category)).size;

    const periodCount = Object.keys(processedData).length;
    let periodLabel = '周期数';
    if (periodDays === 1) {
        periodLabel = '天数';
    } else if (periodDays === 7) {
        periodLabel = '周数';
    } else {
        periodLabel = `${periodDays}天周期数`;
    }

    const statsHtml = `
        <div class="stat-card">
            <div class="stat-value">${totalPapers}</div>
            <div class="stat-label">论文总数</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${totalUpvotes}</div>
            <div class="stat-label">总点赞数</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${uniqueCategories}</div>
            <div class="stat-label">分类数量</div>
        </div>
        <div class="stat-card">
            <div class="stat-value">${periodCount}</div>
            <div class="stat-label">${periodLabel}</div>
        </div>
    `;

    document.getElementById('statsContainer').innerHTML = statsHtml;
}

// 生成图表数据
function generateChartData(topCategories, aggregationType) {
    const periods = Object.keys(processedData).sort((a, b) => {
        return processedData[a].periodNumber - processedData[b].periodNumber;
    });

    const datasets = topCategories.map(category => {
        const data = periods.map(periodKey => {
            const categoryData = processedData[periodKey].categories[category];
            if (!categoryData) return 0;

            if (aggregationType === 'sum') {
                return categoryData.totalUpvotes;
            } else if (aggregationType === 'avg') {
                return categoryData.count > 0 ? Math.round(categoryData.totalUpvotes / categoryData.count * 10) / 10 : 0;
            } else if (aggregationType === 'count') {
                return categoryData.count;
            }
        });

        return {
            label: category,
            data: data,
            backgroundColor: categoryColors[category],
            borderColor: categoryColors[category],
            borderWidth: 0,
            borderRadius: 4,
            hoverBackgroundColor: categoryColors[category] + 'dd'
        };
    });

    return {
        labels: periods.map(p => {
            const period = processedData[p];
            return formatDate(period.startDate) + '\n(' + period.periodNumber + ')';
        }),
        datasets: datasets
    };
}

// 绘制图表
function drawChart(data) {
    const ctx = document.getElementById('trendChart').getContext('2d');

    if (chartInstance) {
        chartInstance.destroy();
    }

    const aggregationType = document.getElementById('aggregationType').value;
    let yAxisLabel = '点赞数';
    if (aggregationType === 'avg') {
        yAxisLabel = '平均点赞数';
    } else if (aggregationType === 'count') {
        yAxisLabel = '论文数量';
    }

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false,
                    position: 'top'
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    titleFont: { size: 12 },
                    bodyFont: { size: 11 },
                    borderColor: '#fff',
                    borderWidth: 1
                }
            },
            scales: {
                x: {
                    stacked: false,
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        font: { size: 11 }
                    }
                },
                y: {
                    beginAtZero: true,
                    stacked: false,
                    title: {
                        display: true,
                        text: yAxisLabel
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                        drawBorder: false
                    }
                }
            }
        }
    });

    // 移除周期之星容器
    const starsContainer = document.getElementById('periodStarsContainer');
    if (starsContainer) {
        starsContainer.remove();
    }
}

// 生成Category选择器
function generateCategorySelector() {
    const content = allCategories.map(cat => `
        <div class="category-checkbox-item">
            <input type="checkbox" id="category-${cat}" ${selectedCategories.has(cat) ? 'checked' : ''} 
                   onchange="toggleCategory('${cat.replace(/'/g, "\\'")}')">
            <label for="category-${cat}">${cat}</label>
        </div>
    `).join('');

    document.getElementById('categorySelectorContent').innerHTML = content;
}

// 切换Category选择
function toggleCategory(category) {
    if (selectedCategories.has(category)) {
        selectedCategories.delete(category);
    } else {
        selectedCategories.add(category);
    }
}

// 全选Category
function selectAllCategories() {
    allCategories.forEach(cat => selectedCategories.add(cat));
    generateCategorySelector();
}

// 全不选Category
function deselectAllCategories() {
    selectedCategories.clear();
    generateCategorySelector();
}

// 开关Category选择器
function toggleCategorySelector() {
    const selector = document.getElementById('categorySelector');
    if (selector.style.display === 'none') {
        selector.style.display = 'block';
        generateCategorySelector();
    } else {
        selector.style.display = 'none';
        updateUI();
    }
}

// 显示详情页面
function showDetailsPanel() {
    const modal = document.getElementById('detailsModal');
    const body = document.getElementById('detailsModalBody');
    
    let html = '<div style="max-height: 80vh; overflow-y: auto;">';
    
    allPapersData.forEach((paper, idx) => {
        const date = paper.date ? formatDate(paper.date) : '未知';
        const category = paper.category || '未分类';
        const upvotes = paper.upvotes || 0;
        const title = paper.title || '无标题';
        const projectPage = paper.projectPage || '';
        
        const linkBtn = projectPage ? 
            `<a href="${projectPage}" target="_blank" class="paper-link-btn">访问项目</a>` :
            '<span class="paper-link-btn" style="background: #ccc; cursor: default;">无链接</span>';
        
        html += `
            <div class="paper-link-item">
                <div class="paper-link-info">
                    <div class="paper-title" title="${title}">${title}</div>
                    <div class="paper-meta">${category} | ${date} | 👍 ${upvotes}</div>
                </div>
                ${linkBtn}
            </div>
        `;
    });
    
    html += '</div>';
    body.innerHTML = html;
    modal.style.display = 'flex';
}

// 关闭详情页面
function closeDetailsPanel() {
    document.getElementById('detailsModal').style.display = 'none';
}

// 生成图例
function generateLegend(topCategories) {
    const legendHtml = topCategories.map(cat => `
        <div class="legend-item">
            <div class="legend-color" style="background-color: ${categoryColors[cat]}"></div>
            <span>${cat}</span>
        </div>
    `).join('');

    document.getElementById('legendGrid').innerHTML = legendHtml;
}

// 生成详细信息
function generateDetails(topCategories, aggregationType) {
    const periods = Object.keys(processedData).sort((a, b) => {
        return processedData[a].periodNumber - processedData[b].periodNumber;
    });

    const detailsHtml = periods.map(periodKey => {
        const period = processedData[periodKey];
        const star = periodStars[periodKey];
        
        const categoryItems = topCategories
            .filter(cat => period.categories[cat])
            .map(cat => {
                const data = period.categories[cat];
                let value;
                if (aggregationType === 'sum') {
                    value = data.totalUpvotes;
                } else if (aggregationType === 'avg') {
                    value = (data.totalUpvotes / data.count).toFixed(1);
                } else if (aggregationType === 'count') {
                    value = data.count;
                }
                return `
                    <div class="category-item">
                        <span class="category-name">${cat}</span>
                        <span class="category-weight">${value}</span>
                    </div>
                `;
            })
            .join('');

        const starHtml = star ? `
            <div style="background: #fff9e6; padding: 10px; margin-top: 10px; border-radius: 6px; border-left: 4px solid #ff9800;">
                <div style="font-size: 12px; font-weight: bold; color: #ff6b6b;">⭐ 周期之星</div>
                <div style="font-size: 12px; color: #555; margin-top: 5px;">${star.title}</div>
                <div style="font-size: 11px; color: #999; margin-top: 3px;">👍 ${star.upvotes}票 | ${star.category}</div>
                ${star.projectPage ? `<a href="${star.projectPage}" target="_blank" style="font-size: 11px; color: #667eea; text-decoration: none;">→ 访问项目</a>` : ''}
            </div>
        ` : '';

        return `
            <div class="period-details">
                <div class="period-header">📅 ${period.label}</div>
                <div>${categoryItems}</div>
                ${starHtml}
            </div>
        `;
    }).join('');

    document.getElementById('detailsContainer').innerHTML = detailsHtml;
}

// 辅助函数
function showLoading(show) {
    document.getElementById('loading').style.display = show ? 'block' : 'none';
}

function showError(message) {
    document.getElementById('error').innerHTML = `<div class="error">${message}</div>`;
}

function clearError() {
    document.getElementById('error').innerHTML = '';
}

// 刷新数据
function refreshData() {
    loadAllData();
}

// 改变周期
function changePeriod() {
    const selected = document.getElementById('periodDays').value;
    periodDays = parseInt(selected);
    console.log(`📅 周期已改为: ${periodDays}天`);
    if (allPapersData.length > 0) {
        processData();
        updateUI();
    }
}

// 事件监听
document.getElementById('aggregationType').addEventListener('change', () => {
    if (allPapersData.length > 0) {
        updateUI();
    }
});

document.getElementById('topN').addEventListener('change', () => {
    if (allPapersData.length > 0) {
        updateUI();
    }
});

// Modal外部点击关闭
document.getElementById('detailsModal').addEventListener('click', (e) => {
    if (e.target.id === 'detailsModal') {
        closeDetailsPanel();
    }
});

document.getElementById('categorySelector').addEventListener('click', (e) => {
    if (e.target.id === 'categorySelector') {
        toggleCategorySelector();
    }
});

// 初始化
window.addEventListener('load', () => {
    loadAllData();
});
