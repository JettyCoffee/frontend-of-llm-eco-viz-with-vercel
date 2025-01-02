import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
    Box, 
    Container, 
    Typography, 
    TextField, 
    Button,
    Paper,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Fade,
    Grid,
    Link
} from '@mui/material';
import { useRouter } from 'next/router';
import useDebounce from '../hooks/useDebounce';
import { getDeepestProjects } from '../utils/helpers';
import { ProjectContext } from '../contexts/ProjectContext';

const Home = () => {
    const { selectedProjects, setSelectedProjects } = useContext(ProjectContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [availableProjects, setAvailableProjects] = useState([]);
    const [filteredProjects, setFilteredProjects] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedProject, setSelectedProject] = useState('');
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);
    const router = useRouter();
    const dropdownRef = useRef(null);
    const listRef = useRef(null);

    // 获取所有项目
    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const response = await fetch('/api/projects/search?q=');
                if (!response.ok) throw new Error('Failed to fetch projects');
                const data = await response.json();
                setAvailableProjects(data.map(project => project.full_name));
            } catch (error) {
                console.error('Error fetching projects:', error);
            }
        };

        fetchProjects();
    }, []);

    // 过滤项目
    useEffect(() => {
        if (debouncedSearchTerm === '') {
            setFilteredProjects([]);
            setShowDropdown(false);
            setHighlightedIndex(-1);
        } else {
            const searchProjects = async () => {
                try {
                    const response = await fetch(`/api/projects/search?q=${encodeURIComponent(debouncedSearchTerm)}`);
                    if (!response.ok) throw new Error('Failed to search projects');
                    const data = await response.json();
                    const projectNames = data.map(project => project.full_name);
                    setFilteredProjects(projectNames);
                    setShowDropdown(projectNames.length > 0);
                    setHighlightedIndex(-1);
                } catch (error) {
                    console.error('Error searching projects:', error);
                }
            };

            searchProjects();
        }
    }, [debouncedSearchTerm]);

    // 处理点击外部关闭下拉菜单
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
                setHighlightedIndex(-1);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // 自动滚动到高亮项
    useEffect(() => {
        if (highlightedIndex >= 0 && listRef.current) {
            const listItems = listRef.current.querySelectorAll('li');
            if (listItems[highlightedIndex]) {
                listItems[highlightedIndex].scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                });
            }
        }
    }, [highlightedIndex]);

    const handleProjectSelect = (project) => {
        setSelectedProject(project);
        setSearchTerm(project.split('/').pop());
        setShowDropdown(false);
        setHighlightedIndex(-1);
    };

    const handleAnalyze = () => {
        if (!selectedProject) {
            alert('请选择一个项目');
            return;
        }
        setSelectedProjects([selectedProject]);
        router.push('/dashboard');
    };

    const handleKeyDown = (e) => {
        if (!showDropdown) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex(prev =>
                prev < filteredProjects.length - 1 ? prev + 1 : prev
            );
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex(prev => (prev > 0 ? prev - 1 : prev));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (highlightedIndex >= 0 && highlightedIndex < filteredProjects.length) {
                handleProjectSelect(filteredProjects[highlightedIndex]);
            }
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setShowDropdown(false);
            setHighlightedIndex(-1);
        }
    };

    return (
        <Box 
            sx={{ 
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                pt: '64px',
                bgcolor: '#f8f9fa'
            }}
        >
            <Container maxWidth="md">
                <Box 
                    sx={{ 
                        textAlign: 'center',
                        py: 8
                    }}
                >
                    {/* 标题 */}
                    <Typography 
                        variant="h2" 
                        component="h1"
                        sx={{ 
                            fontWeight: 600,
                            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            textShadow: '0 0 20px rgba(33, 150, 243, 0.1)',
                            mb: 2
                        }}
                    >
                        LLM Ecosystem Visualization
                    </Typography>

                    {/* 副标题 */}
                    <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 2 }}>
                        <Link
                            href="https://github.com/X-lab2017/open-digger"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                                display: 'inline-block',
                                '&:hover': {
                                    opacity: 0.8
                                }
                            }}
                        >
                            <Box
                                component="img"
                                src="/Data-OpenDigger-2097FF.svg"
                                alt="Data OpenDigger"
                                sx={{ 
                                    height: '20px'
                                }}
                            />
                        </Link>
                        <Link
                            href="https://github.com/zzsyppt/llm-eco-viz"
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{
                                display: 'inline-block',
                                '&:hover': {
                                    opacity: 0.8
                                }
                            }}
                        >
                            <Box
                                component="img"
                                src="/Project-LLM-Eco-Viz-2196F3.svg"
                                alt="Project LLM Eco Viz"
                                sx={{ 
                                    height: '20px'
                                }}
                            />
                        </Link>
                    </Box>

                    {/* 项目介绍 */}
                    <Typography 
                        variant="body1"
                        sx={{ 
                            mb: 6,
                            color: 'text.secondary',
                            maxWidth: '800px',
                            mx: 'auto',
                            lineHeight: 1.8,
                            fontSize: '1.1rem'
                        }}
                    >
                        本项目基于 GitHub 和 Hugging Face 两个开源社区的活动数据，构建了一个开源 AI 大模型生态分析与可视化平台。
                        通过多维度的数据分析和可视化展示，帮助开发者深入了解大模型生态系统的发展动态，为技术选型和生态分析提供有力支持。
                    </Typography>

                    {/* 搜索框和下拉列表 */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            maxWidth: '800px',
                            mx: 'auto',
                            borderRadius: 5,
                            bgcolor: 'background.paper',
                            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                            position: 'relative'
                        }}
                        ref={dropdownRef}
                    >
                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Box sx={{ position: 'relative', flex: 1 }}>
                                <TextField
                                    fullWidth
                                    placeholder="输入 GitHub 项目名称（例如：langchain-chatchat）进行分析"
                                    value={searchTerm}
                                    onChange={(e) => {
                                        setSearchTerm(e.target.value);
                                        setSelectedProject('');
                                    }}
                                    onKeyDown={handleKeyDown}
                                    variant="outlined"
                                    sx={{
                                        '& .MuiOutlinedInput-root': {
                                            borderRadius: 2,
                                            bgcolor: '#f8f9fa'
                                        }
                                    }}
                                />
                                <Fade in={showDropdown}>
                                    <Paper
                                        elevation={4}
                                        sx={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: 0,
                                            right: 0,
                                            maxHeight: 300,
                                            overflowY: 'auto',
                                            zIndex: 1,
                                            mt: 1,
                                            borderRadius: 2,
                                            border: '1px solid',
                                            borderColor: 'divider'
                                        }}
                                    >
                                        <List ref={listRef}>
                                            {filteredProjects.map((project, index) => {
                                                const projectName = project.split('/').pop();
                                                const isHighlighted = index === highlightedIndex;

                                                return (
                                                    <ListItem
                                                        key={project}
                                                        disablePadding
                                                        selected={isHighlighted}
                                                        sx={{
                                                            backgroundColor: isHighlighted ? 'action.hover' : 'transparent',
                                                        }}
                                                    >
                                                        <ListItemButton onClick={() => handleProjectSelect(project)}>
                                                            <ListItemText
                                                                primary={project}
                                                                secondary={projectName}
                                                                primaryTypographyProps={{
                                                                    variant: 'body2',
                                                                    sx: { fontWeight: 500 }
                                                                }}
                                                            />
                                                        </ListItemButton>
                                                    </ListItem>
                                                );
                                            })}
                                        </List>
                                    </Paper>
                                </Fade>
                            </Box>
                            <Button
                                variant="contained"
                                size="large"
                                onClick={handleAnalyze}
                                disabled={!selectedProject}
                                sx={{
                                    minWidth: '120px',
                                    borderRadius: 2,
                                    background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                                    boxShadow: '0 3px 5px 2px rgba(33, 150, 243, .3)',
                                    '&:hover': {
                                        background: 'linear-gradient(45deg, #1976D2 30%, #21CBF3 90%)',
                                    },
                                    '&.Mui-disabled': {
                                        background: 'rgba(0, 0, 0, 0.12)'
                                    }
                                }}
                            >
                                分析
                            </Button>
                        </Box>
                    </Paper>
                </Box>

                {/* 平台功能 */}
                <Box sx={{ py: 8, textAlign: 'center' }}>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            mb: 4,
                            fontWeight: 600,
                            color: 'text.primary'
                        }}
                    >
                        平台功能
                    </Typography>
                    <Typography 
                        component="div"
                        sx={{ 
                            color: 'text.secondary',
                            maxWidth: '800px',
                            mx: 'auto',
                            lineHeight: 1.8,
                            fontSize: '1.1rem',
                            textAlign: 'left'
                        }}
                    >
                        <Box component="ul" sx={{ pl: 2 }}>
                            <Box component="li" sx={{ mb: 2 }}>
                                <strong>GitHub 项目分析：</strong>
                                <ul>
                                    <li>基于 OpenDigger 数据的多维度评分体系</li>
                                    <li>项目活跃度和影响力可视化分析</li>
                                    <li>代码质量和社区健康度评估</li>
                                </ul>
                            </Box>
                            <Box component="li" sx={{ mb: 2 }}>
                                <strong>Hugging Face 模型排行：</strong>
                                <ul>
                                    <li>大模型影响力排行榜</li>
                                    <li>多维度筛选和排序功能</li>
                                    <li>模型详细信息快速查看</li>
                                </ul>
                            </Box>
                            <Box component="li" sx={{ mb: 2 }}>
                                <strong>生态网络分析：</strong>
                                <ul>
                                    <li>模型衍生关系可视化</li>
                                    <li>多视图切换（Top 100/完整网络/作者分组等）</li>
                                    <li>互动式网络图探索</li>
                                </ul>
                            </Box>
                            <Box component="li">
                                <strong>生态数据大屏：</strong>
                                <ul>
                                    <li>语言支持情况分析</li>
                                    <li>作者和组织影响力排行</li>
                                    <li>任务类型分布统计</li>
                                </ul>
                            </Box>
                        </Box>
                    </Typography>
                </Box>

                {/* 技术实现 */}
                <Box sx={{ py: 8, textAlign: 'center' }}>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            mb: 4,
                            fontWeight: 600,
                            color: 'text.primary'
                        }}
                    >
                        技术实现
                    </Typography>
                    <Grid container spacing={4} justifyContent="center">
                        <Grid item xs={12} md={4}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                                }}
                            >
                                <Typography variant="h6" gutterBottom>数据获取与处理</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    • OpenDigger 数据集<br/>
                                    • Hugging Face API<br/>
                                    • 网页爬虫<br/>
                                    • Easy Graph 图计算<br/>
                                    • 数据预处理流水线<br/>
                                    • 增量数据更新
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                                }}
                            >
                                <Typography variant="h6" gutterBottom>前端开发</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    • Next.js 15 + React 19<br/>
                                    • Material-UI 组件库<br/>
                                    • ECharts 数据可视化<br/>
                                    • PyVis 网络图<br/>
                                    • Tailwind CSS<br/>
                                    • 响应式设计
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                                }}
                            >
                                <Typography variant="h6" gutterBottom>后端服务</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    • Flask 框架<br/>
                                    • 影响力算法<br/>
                                    • RESTful API<br/>
                                    • 数据预处理<br/>
                                    • 缓存优化<br/>
                                    • 性能监控
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>

                {/* 影响力算法 */}
                <Box sx={{ py: 8, textAlign: 'center' }}>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            mb: 4,
                            fontWeight: 600,
                            color: 'text.primary'
                        }}
                    >
                        影响力算法
                    </Typography>
                    <Grid container spacing={4} justifyContent="center">
                        <Grid item xs={12} md={6}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                                }}
                            >
                                <Typography variant="h6" gutterBottom>自身影响力计算</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left' }}>
                                    基于以下因素综合计算：<br/>
                                    • 下载量（对数加权）<br/>
                                    • 点赞数（线性加权）<br/>
                                    • Space应用影响力<br/>
                                    • 时间衰减因子<br/><br/>
                                    计算公式：<br/>
                                    I_self = W₁·log(downloads) + W₂·likes + W₃·I_spaces + W₄·e^(-λt)
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                                }}
                            >
                                <Typography variant="h6" gutterBottom>总影响力计算</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left' }}>
                                    迭代计算三个部分：<br/>
                                    • 自身影响力（α₁权重）<br/>
                                    • 子模型影响力（α₂权重）<br/>
                                    • 父模型影响力（α₃权重）<br/><br/>
                                    计算公式：<br/>
                                    I_total = α₁·I_self + α₂·I_child + α₃·I_parent
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>

                {/* 项目架构 */}
                <Box sx={{ py: 8, textAlign: 'center' }}>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            mb: 4,
                            fontWeight: 600,
                            color: 'text.primary'
                        }}
                    >
                        项目架构
                    </Typography>
                    <Grid container spacing={4} justifyContent="center">
                        <Grid item xs={12} md={4}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                                }}
                            >
                                <Typography variant="h6" gutterBottom>数据获取模块</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left' }}>
                                    • 模型元数据获取<br/>
                                    &nbsp;&nbsp;- 基础信息采集<br/>
                                    &nbsp;&nbsp;- 下载量统计<br/>
                                    &nbsp;&nbsp;- 点赞数追踪<br/>
                                    • 作者信息采集<br/>
                                    &nbsp;&nbsp;- 个人/组织识别<br/>
                                    &nbsp;&nbsp;- 影响力评估<br/>
                                    • 衍生关系分析<br/>
                                    &nbsp;&nbsp;- Model Tree 构建<br/>
                                    &nbsp;&nbsp;- 关系类型识别
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                                }}
                            >
                                <Typography variant="h6" gutterBottom>数据处理模块</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left' }}>
                                    • 图数据处理<br/>
                                    &nbsp;&nbsp;- 节点属性定义<br/>
                                    &nbsp;&nbsp;- 边关系构建<br/>
                                    &nbsp;&nbsp;- 图计算优化<br/>
                                    • 影响力计算<br/>
                                    &nbsp;&nbsp;- 自身影响力<br/>
                                    &nbsp;&nbsp;- 关系传播<br/>
                                    • 数据预处理<br/>
                                    &nbsp;&nbsp;- 清洗与过滤<br/>
                                    &nbsp;&nbsp;- 格式标准化
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                                }}
                            >
                                <Typography variant="h6" gutterBottom>可视化模块</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left' }}>
                                    • 排行榜系统<br/>
                                    &nbsp;&nbsp;- 多维度排序<br/>
                                    &nbsp;&nbsp;- 实时更新<br/>
                                    &nbsp;&nbsp;- 筛选功能<br/>
                                    • 网络关系图<br/>
                                    &nbsp;&nbsp;- 多视图切换<br/>
                                    &nbsp;&nbsp;- 交互式探索<br/>
                                    • 数据大屏<br/>
                                    &nbsp;&nbsp;- 实时统计<br/>
                                    &nbsp;&nbsp;- 趋势分析
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>

                {/* 未来规划 */}
                <Box sx={{ py: 8, textAlign: 'center' }}>
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            mb: 4,
                            fontWeight: 600,
                            color: 'text.primary'
                        }}
                    >
                        未来规划
                    </Typography>
                    <Grid container spacing={4} justifyContent="center">
                        <Grid item xs={12} md={4}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                                }}
                            >
                                <Typography variant="h6" gutterBottom>数据扩展</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left' }}>
                                    • 扩大数据采集范围<br/>
                                    • 增加历史数据分析<br/>
                                    • 引入更多评估维度<br/>
                                    • 优化数据更新机制
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                                }}
                            >
                                <Typography variant="h6" gutterBottom>功能优化</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left' }}>
                                    • 完善评分算法<br/>
                                    • 增强可视化效果<br/>
                                    • 提升用户交互体验<br/>
                                    • 添加更多分析维度
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={4}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: 3,
                                    height: '100%',
                                    borderRadius: 2,
                                    bgcolor: 'background.paper',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
                                }}
                            >
                                <Typography variant="h6" gutterBottom>生态拓展</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'left' }}>
                                    • 支持更多开源平台<br/>
                                    • 深化生态分析<br/>
                                    • 开放数据接口<br/>
                                    • 建立开发者社区
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </Box>
    );
};

export default Home;