/**
 * 「理论基础」的课程内容：一条从零开始的机器人学学习路线，按领域分模块，每个模块有独立页面。
 *
 * 所有推荐资料都可以免费公开获取（教材 PDF、课程主页、讲座视频、论文预印本、开源代码），符合本项目零成本原则。
 * 公式用 KaTeX 语法书写，构建时在服务端渲染成 HTML。
 */

export type ResourceKind = 'book' | 'course' | 'video' | 'notes' | 'paper' | 'tool';

export interface Resource {
  title: string;
  by: string; // 作者 / 机构
  url: string;
  kind: ResourceKind;
  note?: string; // 一句话说明：看哪几章、为什么推荐
  primary?: boolean; // 该主题的首选资料
}

export interface Topic {
  id: string;
  title: string;
  en: string; // 英文术语
  hours: number; // 预计学习时长（小时）
  summary: string; // 一段话讲清「这是什么、为什么重要」
  points: string[]; // 核心要点
  formulas?: { latex: string; caption: string }[];
  resources: Resource[];
  quiz?: string[]; // 自测问题
  papers?: string[]; // 与本站每日推荐相关的关键词（可点去搜索）
}

export interface Module {
  id: string; // 也是 URL slug：foundations/<id>/
  emoji: string;
  title: string;
  en: string;
  tagline: string; // 总览卡片上的一句话
  intro: string; // 模块页顶部的介绍
  outcomes: string[]; // 学完能做什么
  prereq?: string[]; // 依赖的模块 id
  topics: Topic[];
}

/* 常用资料，多个主题复用 */
const R = {
  underactuated: (ch: string, url: string, note?: string): Resource => ({
    title: `Underactuated Robotics（${ch}）`,
    by: 'Russ Tedrake · MIT',
    url,
    kind: 'book',
    note,
  }),
  manipulation: (ch: string, url: string, note?: string): Resource => ({
    title: `Robotic Manipulation（${ch}）`,
    by: 'Russ Tedrake · MIT',
    url,
    kind: 'book',
    note,
  }),
  mr: (ch: string, note?: string): Resource => ({
    title: `Modern Robotics（${ch}）`,
    by: 'Lynch & Park · Northwestern',
    url: 'https://hades.mech.northwestern.edu/index.php/Modern_Robotics',
    kind: 'book',
    note,
  }),
  cmu745: (lec: string, note?: string): Resource => ({
    title: `16-745 Optimal Control（${lec}）`,
    by: 'Zac Manchester · CMU',
    url: 'https://optimalcontrol.ri.cmu.edu/lectures/',
    kind: 'video',
    note,
  }),
  cs285: (lec: string, note?: string): Resource => ({
    title: `CS285 Deep RL（${lec}）`,
    by: 'Sergey Levine · UC Berkeley',
    url: 'https://rail.eecs.berkeley.edu/deeprlcourse/',
    kind: 'course',
    note,
  }),
  barfoot: (ch: string, note?: string): Resource => ({
    title: `State Estimation for Robotics（${ch}）`,
    by: 'Tim Barfoot · U of Toronto',
    url: 'http://asrl.utias.utoronto.ca/~tdb/bib/barfoot_ser17.pdf',
    kind: 'book',
    note,
  }),
  brunton: (note?: string): Resource => ({
    title: 'Control Bootcamp',
    by: 'Steve Brunton (YouTube)',
    url: 'https://www.youtube.com/playlist?list=PLMrJAkhIeNNR20Mz-VpzgfQs5zrYi085m',
    kind: 'video',
    note,
  }),
};

export const modules: Module[] = [
  /* ================================================================== */
  {
    id: 'math',
    emoji: '📐',
    title: '数学与物理准备',
    en: 'Mathematical Preliminaries',
    tagline: '线性代数、微积分、概率、优化——后面每一章都在用的四件工具。',
    intro:
      '机器人学是把线性代数、微积分、概率和优化用在物理系统上。这一阶段不求深，只求把后面反复出现的工具（矩阵分解、雅可比、高斯分布、拉格朗日乘子）用熟。建议边学后面的内容边回头补。',
    outcomes: ['能读懂并推导机器人论文里的矩阵公式', '能把一个工程问题写成优化问题并判断它是否凸', '理解高斯分布的运算，为估计与 RL 打底'],
    topics: [
      {
        id: 'linear-algebra',
        title: '线性代数',
        en: 'Linear Algebra',
        hours: 30,
        summary:
          '机器人里的一切——位姿、速度、力、协方差、约束——都是向量和矩阵。你需要对「线性变换的几何意义」有直觉，并能熟练使用 SVD、特征分解、伪逆和二次型。',
        points: [
          '向量空间、基变换、正交矩阵与旋转的关系',
          '特征值 / 特征向量、对称正定矩阵与二次型（能量、代价函数、协方差都是二次型）',
          'SVD 与伪逆：奇异构型、最小二乘、零空间投影的数学基础',
          '矩阵微积分：∂(xᵀAx)/∂x、链式法则，是推导控制律和梯度的日常工具',
        ],
        formulas: [
          { latex: 'A = U\\Sigma V^{\\top},\\qquad A^{\\dagger} = V\\Sigma^{\\dagger}U^{\\top}', caption: 'SVD 与 Moore–Penrose 伪逆' },
          { latex: '\\frac{\\partial}{\\partial x}\\left(x^{\\top}Ax\\right) = (A + A^{\\top})x', caption: '二次型的梯度' },
        ],
        resources: [
          { title: 'Essence of Linear Algebra', by: '3Blue1Brown', url: 'https://www.3blue1brown.com/topics/linear-algebra', kind: 'video', note: '先看这 16 集建立几何直觉，每集十几分钟', primary: true },
          { title: 'MIT 18.06 Linear Algebra', by: 'Gilbert Strang · MIT OCW', url: 'https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/', kind: 'course', note: '完整视频 + 习题，重点看四个基本子空间、投影、SVD' },
          { title: 'EE263 Introduction to Linear Dynamical Systems', by: 'Stephen Boyd · Stanford', url: 'https://ee263.stanford.edu/', kind: 'course', note: '线性代数直接连到线性动力系统，讲义与视频免费' },
          { title: 'The Matrix Cookbook', by: 'Petersen & Pedersen', url: 'https://www.math.uwaterloo.ca/~hwolkowi/matrixcookbook.pdf', kind: 'notes', note: '矩阵求导速查表，推公式时常备' },
        ],
        quiz: ['为什么旋转矩阵的逆等于它的转置？', '雅可比矩阵奇异时伪逆会发生什么？零空间的物理含义是什么？'],
      },
      {
        id: 'calculus-ode',
        title: '多元微积分与常微分方程',
        en: 'Multivariable Calculus & ODEs',
        hours: 20,
        summary:
          '机器人是连续时间的动力系统 ẋ = f(x, u)。你需要会线性化（泰勒展开取一阶）、会数值积分（欧拉、RK4），并理解线性系统的解 e^{At} 与稳定性和特征值的关系。',
        points: [
          '梯度、雅可比、海森矩阵；泰勒展开与线性化 A = ∂f/∂x，B = ∂f/∂u',
          '线性常微分方程的解 x(t) = e^{At}x₀，特征值实部决定稳定性',
          '数值积分：显式欧拉、半隐式欧拉、RK4，以及步长与稳定性的关系（仿真器都在做这件事）',
          '离散化：连续系统 → 离散系统 x_{k+1} = f_d(x_k, u_k)，控制器几乎总是离散实现的',
        ],
        formulas: [
          { latex: '\\dot{x} = f(x,u)\\;\\approx\\; f(x_0,u_0) + A\\,\\delta x + B\\,\\delta u,\\quad A = \\tfrac{\\partial f}{\\partial x},\\; B = \\tfrac{\\partial f}{\\partial u}', caption: '在工作点线性化' },
          { latex: 'x_{k+1} = x_k + h\\,f(x_k,u_k)\\quad(\\text{显式欧拉})', caption: '最简单的离散化' },
        ],
        resources: [
          { title: 'MIT 18.02 Multivariable Calculus', by: 'MIT OCW', url: 'https://ocw.mit.edu/courses/18-02-multivariable-calculus-fall-2007/', kind: 'course', note: '只需要梯度 / 雅可比 / 链式法则 / 拉格朗日乘子这几讲' },
          { title: 'Differential Equations and Dynamical Systems', by: 'Steve Brunton (YouTube)', url: 'https://www.youtube.com/playlist?list=PLMrJAkhIeNNTYaOnVI3QpH7jgULnAmvPA', kind: 'video', note: '面向工程的 ODE 与动力系统，讲得很直观', primary: true },
          R.cmu745('Lecture 2: Dynamics Discretization & Stability', '从机器人角度讲积分器选择和稳定性，一节课讲透'),
        ],
        quiz: ['为什么显式欧拉模拟无阻尼单摆时能量会越来越大？', '一个离散线性系统 x_{k+1}=A x_k 稳定的条件是什么？'],
      },
      {
        id: 'probability',
        title: '概率与统计',
        en: 'Probability & Statistics',
        hours: 20,
        summary:
          '传感器有噪声、模型有误差、策略有随机性——状态估计和强化学习都建立在概率之上。核心是把多元高斯分布用熟，理解贝叶斯法则和期望 / 方差的运算。',
        points: [
          '条件概率与贝叶斯法则：先验 × 似然 ∝ 后验，是所有滤波器的骨架',
          '多元高斯：均值、协方差、边缘化和条件化仍是高斯（卡尔曼滤波成立的原因）',
          '期望、方差、协方差传播：y = Ax + b ⇒ Σ_y = AΣ_xAᵀ',
          '最大似然与最大后验（MAP）：非线性最小二乘为什么等于高斯噪声下的 MAP',
        ],
        formulas: [
          { latex: 'p(x\\mid z) = \\frac{p(z\\mid x)\\,p(x)}{p(z)}', caption: '贝叶斯法则' },
          { latex: '\\mathcal{N}(x;\\mu,\\Sigma) = \\frac{1}{\\sqrt{(2\\pi)^n|\\Sigma|}}\\exp\\!\\left(-\\tfrac12 (x-\\mu)^{\\top}\\Sigma^{-1}(x-\\mu)\\right)', caption: '多元高斯分布' },
        ],
        resources: [
          { title: 'Stat 110: Probability', by: 'Joe Blitzstein · Harvard', url: 'https://projects.iq.harvard.edu/stat110/home', kind: 'course', note: '视频 + 免费教材，讲故事式的概率课', primary: true },
          { title: 'Kalman and Bayesian Filters in Python（第 1–3 章）', by: 'Roger Labbe', url: 'https://github.com/rlabbe/Kalman-and-Bayesian-Filters-in-Python', kind: 'book', note: '用代码把高斯与贝叶斯讲得非常直观，后面状态估计还会用到' },
        ],
        quiz: ['两个独立高斯测量相乘（融合）后，方差为什么一定变小？', '为什么高斯噪声下的 MAP 估计等价于加权最小二乘？'],
      },
      {
        id: 'optimization',
        title: '数值优化',
        en: 'Numerical Optimization',
        hours: 30,
        summary:
          '现代机器人控制几乎全是「写一个代价函数然后求解」：逆运动学、轨迹优化、MPC、策略学习都是优化问题。要理解梯度法、牛顿法、约束优化的 KKT 条件，以及凸与非凸的区别。',
        points: [
          '无约束优化：梯度下降、牛顿法、拟牛顿（BFGS）、线搜索与信赖域',
          '约束优化：拉格朗日函数、KKT 条件、对偶；等式约束用牛顿-KKT，不等式约束用内点法 / 有效集 / 增广拉格朗日',
          '凸优化：LP、QP、SOCP，为什么凸问题「解一次就对」，MPC 大量依赖 QP 求解器',
          '非线性规划（NLP）与 SQP：轨迹优化的主力算法',
        ],
        formulas: [
          { latex: '\\min_x\\; f(x)\\quad \\text{s.t. } c(x)=0,\\; h(x)\\le 0', caption: '一般约束优化问题' },
          { latex: '\\nabla f(x^{*}) + \\nabla c(x^{*})^{\\top}\\lambda + \\nabla h(x^{*})^{\\top}\\mu = 0,\\;\\; \\mu \\ge 0,\\;\\; \\mu^{\\top}h(x^{*}) = 0', caption: 'KKT 一阶必要条件' },
        ],
        resources: [
          { title: 'Convex Optimization', by: 'Boyd & Vandenberghe · Stanford', url: 'https://web.stanford.edu/~boyd/cvxbook/', kind: 'book', note: '免费 PDF + EE364A 视频；前 5 章 + 第 9–11 章足够', primary: true },
          R.cmu745('Lectures 3–6: Optimization', '专门面向控制的优化速成：牛顿法、KKT、正则化、增广拉格朗日'),
          { title: 'Algorithms for Optimization', by: 'Kochenderfer & Wheeler · MIT Press', url: 'https://algorithmsbook.com/optimization/', kind: 'book', note: '免费 PDF，每个算法配 Julia 代码和图示' },
        ],
        quiz: ['为什么牛顿法在最优点附近收敛快，但海森矩阵不正定时需要正则化？', 'QP 与一般 NLP 在求解上的本质区别是什么？MPC 为什么偏爱 QP？'],
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'modeling',
    emoji: '🦾',
    title: '运动学与动力学建模',
    en: 'Kinematics & Dynamics',
    tagline: '用数学描述机器人在哪里、怎么动、受什么力：李群、雅可比、运动方程、接触。',
    intro:
      '这是机器人学的「本体论」：如何用数学描述一个由刚体和关节组成的机构在哪里、怎么动、受什么力。从旋转与齐次变换出发，经过运动学与雅可比、拉格朗日动力学，到递归算法、接触力学和足式机器人常用的简化模型。学完你应该能对一个机械臂或四足机器人写出它的正运动学、雅可比和运动方程，并在 MuJoCo / Pinocchio 里验证。',
    outcomes: ['对任意开链机器人写出 PoE 正运动学与雅可比', '推导并数值验证 M(q)q̈ + C q̇ + g = τ', '理解接触 / 冲击为什么让动力学变成混合系统', '知道什么时候用 SRBD / LIP 等简化模型'],
    prereq: ['math'],
    topics: [
      {
        id: 'rigid-body',
        title: '刚体位姿与李群 SO(3) / SE(3)',
        en: 'Rigid-Body Motion, Rotations & Twists',
        hours: 20,
        summary:
          '一个刚体的位姿由旋转 R ∈ SO(3) 和平移 p 组成，合在一起是齐次变换 T ∈ SE(3)。旋转不是向量空间（不能直接相加），这是机器人学最容易出 bug 的地方——要掌握旋转矩阵、四元数、轴角、指数坐标之间的关系，以及「在切空间做微小扰动」的思想。',
        points: [
          '旋转的多种表示：旋转矩阵、欧拉角（有万向锁）、轴角、单位四元数（双重覆盖）',
          '齐次变换 T 与坐标系链：T_ac = T_ab T_bc；左乘 / 右乘分别对应世界系 / 本体系变换',
          '角速度与旋量（twist）ξ = (ω, v)，se(3) 与指数映射 exp: se(3) → SE(3)；伴随变换 Ad_T 变换旋量与力旋量',
          '在李群上做优化 / 滤波：用切空间的小扰动 δ ∈ ℝ⁶ 表示误差（⊞ / ⊟ 运算），左 / 右扰动的区别',
        ],
        formulas: [
          { latex: 'T = \\begin{bmatrix} R & p \\\\ 0 & 1 \\end{bmatrix} \\in SE(3),\\quad R^{\\top}R = I,\\; \\det R = 1', caption: '齐次变换矩阵' },
          { latex: 'R = \\exp([\\hat{\\omega}]\\theta) = I + \\sin\\theta\\,[\\hat{\\omega}] + (1-\\cos\\theta)[\\hat{\\omega}]^2', caption: 'Rodrigues 公式：轴角 → 旋转矩阵' },
        ],
        resources: [
          R.mr('第 3 章 Rigid-Body Motions', '免费 PDF + 配套视频 + Coursera，本模块的主教材'),
          { title: 'A micro Lie theory for state estimation in robotics', by: 'Solà, Deray, Atchuthan', url: 'https://arxiv.org/abs/1812.01537', kind: 'paper', note: '把李群工具讲成「工程手册」，估计与优化都要用', primary: true },
          R.cmu745('Lectures 14–16: Rotations', '如何在带旋转的状态上做 LQR / 优化'),
          { title: 'Quaternion kinematics for the error-state Kalman filter', by: 'Joan Solà', url: 'https://arxiv.org/abs/1711.02508', kind: 'notes', note: '四元数运算最完整的速查手册' },
        ],
        quiz: ['为什么不能直接对两个旋转矩阵取平均？正确做法是什么？', '本体系角速度 ω_b 与世界系角速度 ω_w 的关系是什么？'],
      },
      {
        id: 'kinematics',
        title: '正 / 逆运动学与雅可比',
        en: 'Forward / Inverse Kinematics & Jacobians',
        hours: 25,
        summary:
          '正运动学回答「给定关节角，末端在哪」；雅可比回答「关节速度如何映射到末端速度」；逆运动学回答「末端要到哪，关节该转多少」。指数积（PoE）公式让这些推导变得系统而优雅，而雅可比几乎出现在之后所有控制算法里。',
        points: [
          '指数积公式 T(θ) = e^{[S₁]θ₁} ⋯ e^{[Sₙ]θₙ} M，比 D-H 参数更少出错；URDF / MJCF 里的关节树如何对应',
          '空间 / 本体雅可比，奇异构型与可操作度椭球；力与速度的对偶 τ = Jᵀ F',
          '数值逆运动学：牛顿-拉夫森、阻尼最小二乘（DLS）、零空间投影实现多任务优先级',
          '把 IK 写成 QP：加关节限位、避障、速度约束——这就是「任务空间控制」的雏形',
          '闭链与并联机构、轮式移动机器人运动学（差速、麦克纳姆）、四旋翼的运动学约束',
        ],
        formulas: [
          { latex: 'T(\\theta) = e^{[\\mathcal{S}_1]\\theta_1}\\, e^{[\\mathcal{S}_2]\\theta_2}\\cdots e^{[\\mathcal{S}_n]\\theta_n}\\, M', caption: '指数积（PoE）正运动学' },
          { latex: '\\mathcal{V} = J(\\theta)\\,\\dot{\\theta},\\qquad \\dot{\\theta} = J^{\\top}(JJ^{\\top} + \\lambda^2 I)^{-1}\\,\\mathcal{V}_d', caption: '雅可比与阻尼最小二乘逆运动学' },
        ],
        resources: [
          R.mr('第 4–6 章', '正运动学、速度运动学、逆运动学'),
          R.manipulation('Ch. 3 Basic Pick and Place', 'https://manipulation.csail.mit.edu/pick.html', '在线教材 + Drake 交互 notebook，把 IK 写成优化问题的现代视角'),
          { title: 'CS223A Introduction to Robotics', by: 'Oussama Khatib · Stanford', url: 'https://see.stanford.edu/Course/CS223A', kind: 'course', note: '经典入门课完整视频（Stanford Engineering Everywhere）', primary: true },
          { title: 'QUT Robot Academy', by: 'Peter Corke', url: 'https://robotacademy.net.au/', kind: 'video', note: '短视频拆解每个概念，配 Python / MATLAB 工具箱' },
        ],
        quiz: ['6 自由度机械臂在奇异构型附近，为什么末端很小的速度需求会导致巨大的关节速度？', '零空间投影 (I − J⁺J) 为什么可以在不影响主任务的前提下执行次任务？'],
        papers: ['manipulation', 'dexterous'],
      },
      {
        id: 'dynamics',
        title: '刚体动力学：拉格朗日与运动方程',
        en: 'Rigid-Body Dynamics',
        hours: 30,
        summary:
          '动力学告诉你力 / 力矩如何产生运动。用拉格朗日方法（L = 动能 − 势能）可以系统地推出机器人的运动方程 M(q)q̈ + C(q, q̇)q̇ + g(q) = τ。理解质量矩阵、科氏 / 向心项、重力项各自的物理意义，是所有基于模型的控制的前提。',
        points: [
          '拉格朗日方程与广义坐标；为什么它比牛顿-欧拉更适合推导闭式方程',
          '机器人动力学标准形式：质量矩阵 M(q) 对称正定、Ṃ − 2C 反对称、参数线性性 Y(q,q̇,q̈)π = τ（辨识的基础）',
          '欠驱动系统：控制输入数少于自由度数（单摆车、四足、无人机），动力学约束不能被抵消',
          '能量与被动性；哈密顿形式与动量；为什么这些性质在控制设计里有用',
        ],
        formulas: [
          { latex: '\\frac{d}{dt}\\frac{\\partial L}{\\partial \\dot{q}} - \\frac{\\partial L}{\\partial q} = \\tau,\\qquad L = T(q,\\dot q) - V(q)', caption: '欧拉–拉格朗日方程' },
          { latex: 'M(q)\\,\\ddot{q} + C(q,\\dot{q})\\,\\dot{q} + g(q) = \\tau + J_c(q)^{\\top} f_c', caption: '机器人运动方程（含接触力）' },
        ],
        resources: [
          R.underactuated('Ch. 1–3 + Appendix: Multi-Body Dynamics', 'https://underactuated.mit.edu/multibody.html', '在线教材 + 每年更新的课程视频，机器人动力学与控制的必读'),
          R.mr('第 8 章 Dynamics of Open Chains', '拉格朗日 + 牛顿-欧拉两条路线都讲'),
          { title: 'A Mathematical Introduction to Robotic Manipulation', by: 'Murray, Li, Sastry · Caltech', url: 'http://www.cds.caltech.edu/~murray/books/MLS/pdf/mls94-complete.pdf', kind: 'book', note: '免费 PDF，李群视角的经典，第 4 章动力学', primary: true },
          { title: 'Classical Dynamics（讲义）', by: 'David Tong · Cambridge', url: 'https://www.damtp.cam.ac.uk/user/tong/dynamics.html', kind: 'notes', note: '物理系视角的拉格朗日 / 哈密顿力学，补物理直觉' },
        ],
        quiz: ['质量矩阵 M(q) 为什么一定对称正定？它的物理含义是什么？', '为什么欠驱动系统不能用「计算力矩法」把动力学完全抵消？'],
      },
      {
        id: 'rbd-algorithms',
        title: '空间向量代数与递归动力学算法',
        en: 'Spatial Algebra, RNEA / ABA / CRBA & Derivatives',
        hours: 20,
        summary:
          '闭式拉格朗日方程在几十个自由度上不可行，实际软件（Pinocchio、MuJoCo、Drake）都用 Featherstone 的空间向量代数与 O(n) 递归算法：RNEA 算逆动力学、ABA 算正动力学、CRBA 算质量矩阵。理解它们的结构，才能读懂仿真器源码、正确处理浮动基座，以及利用解析导数做优化。',
        points: [
          '空间向量（6D 运动 / 力向量）、空间惯量、Plücker 坐标；关节模型与运动子空间 S',
          'RNEA：向外递推速度 / 加速度，向内递推力，O(n) 得到 τ = ID(q, q̇, q̈)',
          'ABA：铰接体惯量，O(n) 正动力学 q̈ = FD(q, q̇, τ)；CRBA 组合刚体算法求 M(q)',
          '浮动基座：把基座当 6 自由度虚关节，广义坐标 q = (基座位姿, 关节角)，速度不等于坐标导数',
          '动力学的解析导数（∂ID/∂q 等）：让 DDP / MPC 快一个量级；代码生成与自动微分',
        ],
        formulas: [
          { latex: '\\tau = \\mathrm{ID}(q,\\dot q,\\ddot q) = M(q)\\ddot q + h(q,\\dot q),\\qquad M_{ij} = \\mathrm{CRBA}:\\; S_i^{\\top} I^c_{\\max(i,j)} S_j', caption: '逆动力学（RNEA）与质量矩阵（CRBA）的结构' },
        ],
        resources: [
          { title: 'Spatial Vector Algebra & Rigid-Body Dynamics（幻灯片教程）', by: 'Roy Featherstone', url: 'http://royfeatherstone.org/spatial/', kind: 'notes', note: '空间向量代数发明者的免费教程，RBDA 一书的精华', primary: true },
          { title: 'Analytical Derivatives of Rigid Body Dynamics Algorithms', by: 'Carpentier & Mansard · RSS 2018', url: 'https://hal.science/hal-01790971', kind: 'paper', note: 'Pinocchio 解析导数的原理' },
          { title: 'Pinocchio', by: 'Carpentier 等 · INRIA', url: 'https://github.com/stack-of-tasks/pinocchio', kind: 'tool', note: '开源刚体动力学库（RNEA / ABA / CRBA / 解析导数），用来验证你推的公式' },
          { title: 'MuJoCo 文档：Computation', by: 'Google DeepMind', url: 'https://mujoco.readthedocs.io/en/stable/computation/index.html', kind: 'notes', note: '一个成熟仿真器每一步到底算了什么' },
        ],
        quiz: ['为什么 RNEA 是 O(n) 而直接构造 M(q) 再求逆是 O(n³)？', '浮动基座机器人的广义速度为什么不能写成广义坐标的时间导数？'],
      },
      {
        id: 'contact',
        title: '接触与冲击动力学、混合系统',
        en: 'Contact, Impact & Hybrid Dynamics',
        hours: 25,
        summary:
          '足式行走和抓取的本质都是接触：接触力单边（只能推不能拉）、有摩擦锥约束、状态在触地瞬间跳变。这些让动力学变成互补问题与混合系统，也是仿真器最难、控制器最容易出错的地方。',
        points: [
          '单边接触的互补条件 0 ≤ φ(q) ⊥ λ ≥ 0；库仑摩擦锥与其多面体近似',
          '刚性接触求解：LCP / 时间步进（Stewart–Trinkle）；软接触模型（弹簧-阻尼、MuJoCo 的软约束）',
          '冲击：速度跳变的冲量-动量方程，恢复系数；足式机器人的触地重置映射',
          '混合系统：连续流 + 离散跳变（守卫与重置），庞加莱映射与极限环稳定性',
          '接触隐式轨迹优化 vs 预先给定接触序列；为什么接触让梯度不连续',
        ],
        formulas: [
          { latex: '0 \\le \\phi(q)\\;\\perp\\;\\lambda_n \\ge 0,\\qquad \\|\\lambda_t\\| \\le \\mu\\,\\lambda_n', caption: '单边接触互补条件与摩擦锥' },
          { latex: 'M(q)\\,(\\dot q^{+} - \\dot q^{-}) = J_c^{\\top}\\Lambda,\\qquad J_c\\,\\dot q^{+} = 0', caption: '刚性完全非弹性冲击的冲量-动量关系' },
        ],
        resources: [
          R.underactuated('Ch. Simple Models of Walking / Model Systems with Contact', 'https://underactuated.mit.edu/simple_legs.html', '混合系统、庞加莱映射、被动行走'),
          R.manipulation('Ch. Force Control / Contact', 'https://manipulation.csail.mit.edu/force.html', '操作视角的接触建模与力控'),
          { title: 'Contact Models in Robotics: a Comparative Analysis', by: 'Le Lidec 等 · 2023', url: 'https://arxiv.org/abs/2304.06372', kind: 'paper', note: '系统比较各仿真器的接触模型', primary: true },
          { title: 'Drake：Hydroelastic Contact 用户指南', by: 'Toyota Research Institute', url: 'https://drake.mit.edu/doxygen_cxx/group__hydroelastic__user__guide.html', kind: 'notes', note: '一种可微、连续的接触模型的工程解释' },
        ],
        quiz: ['为什么「脚触地」会让 RL 策略梯度或轨迹优化的梯度不可靠？', '软接触与刚性接触各自的优缺点？仿真器为什么普遍选软接触？'],
        papers: ['contact', 'legged'],
      },
      {
        id: 'reduced-models',
        title: '浮动基座、质心动力学与简化模型',
        en: 'Floating Base, Centroidal Dynamics & Template Models',
        hours: 15,
        summary:
          '足式机器人全身动力学有几十个自由度，实时规划往往用简化模型：线性倒立摆（LIP）、弹簧负载倒立摆（SLIP）、单刚体模型（SRBD）、质心动力学。理解每个模型忽略了什么，就能理解 MPC 为什么能工作、什么时候会失效。',
        points: [
          '浮动基座的欠驱动：基座 6 自由度无直接驱动，只能通过接触力改变动量',
          '质心动量与质心动力学：ḣ = Σ 外力 / 力矩，全身控制的「上层约束」',
          'LIP：零力矩点（ZMP）与捕获点，双足步态生成的经典工具',
          'SRBD：忽略腿部惯量，把机器人当一个带接触力的刚体，四足凸 MPC 的模型',
          '从简化模型到全身：WBC 负责把简化模型的输出映射到关节力矩',
        ],
        formulas: [
          { latex: '\\ddot{x} = \\frac{g}{z_c}\\,(x - p_{\\text{zmp}})', caption: '线性倒立摆（LIP）' },
          { latex: 'm\\ddot{p} = \\sum_i f_i - mg,\\qquad \\frac{d}{dt}(I\\omega) = \\sum_i (r_i - p)\\times f_i', caption: '单刚体（SRBD）动力学' },
        ],
        resources: [
          R.underactuated('Ch. Simple Models of Walking and Running', 'https://underactuated.mit.edu/simple_legs.html', 'LIP、SLIP、被动行走、ZMP', ),
          { title: 'Dynamic Locomotion in the MIT Cheetah 3 Through Convex MPC', by: 'Di Carlo 等 · IROS 2018', url: 'https://dspace.mit.edu/handle/1721.1/138000', kind: 'paper', note: 'SRBD 模型的典型应用', primary: true },
          { title: 'A Unified MPC Framework for Whole-Body Dynamic Locomotion and Manipulation', by: 'Sleiman, Farshidian, Minniti, Hutter · RA-L 2021', url: 'https://arxiv.org/abs/2103.00946', kind: 'paper', note: '质心动力学 + 全身运动学的 MPC 模型' },
          R.cmu745('Lecture 17: Hybrid Systems and Legged Robots'),
        ],
        quiz: ['ZMP 落在支撑多边形之外意味着什么？', 'SRBD 忽略腿部惯量在什么情况下会出问题？'],
        papers: ['humanoid', 'locomotion'],
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'control',
    emoji: '🎛️',
    title: '经典控制与最优控制 / MPC',
    en: 'Classical & Optimal Control, MPC',
    tagline: '从 PID 与李雅普诺夫，到 LQR、轨迹优化、MPC 和全身控制。',
    intro:
      '有了模型就可以设计控制器。这条路线从反馈基础与线性系统理论出发，经过基于模型的关节 / 任务空间控制、非线性与安全控制，到 LQR、动态规划、轨迹优化，最后到达今天足式与操作机器人上广泛部署的 MPC 和全身控制。Russ Tedrake 的 Underactuated Robotics 与 CMU 16-745 是这一模块的两条主线。',
    outcomes: ['能为一个机械臂设计并调好计算力矩 / 阻抗控制器', '能推导 LQR 并沿轨迹用 TVLQR 稳定非线性系统', '能用 CasADi 写一个直接配点轨迹优化', '理解四足 / 人形机器人 MPC + WBC 架构的每一层'],
    prereq: ['modeling'],
    topics: [
      {
        id: 'feedback',
        title: '反馈控制基础与线性系统理论',
        en: 'Feedback Fundamentals & Linear Systems',
        hours: 30,
        summary:
          '反馈的本质是「用误差修正动作」。先理解 PID 与稳定性（极点 / 特征值），然后是状态空间语言：可控性、可观性、极点配置、观测器与分离原理，以及频域里的带宽、相位裕度这些工程师天天用的概念。',
        points: [
          'PID 的物理直觉与整定；积分饱和、微分噪声、抗饱和',
          '状态空间 ẋ = Ax + Bu：可控性 / 可观性矩阵，极点配置，Luenberger 观测器，分离原理',
          '频域基础：传递函数、Bode 图、带宽、增益 / 相位裕度、延迟对稳定性的杀伤力',
          '离散控制器实现：采样率、零阶保持、抗混叠滤波、数值微分的噪声',
          '鲁棒性直觉：模型不准时会发生什么；高增益的代价',
        ],
        formulas: [
          { latex: 'u = K_p e + K_i\\!\\int e\\,dt + K_d\\,\\dot e', caption: 'PID' },
          { latex: '\\mathcal{C} = [B\\; AB\\; \\cdots\\; A^{n-1}B],\\qquad \\text{rank}\\,\\mathcal{C} = n \\iff \\text{可控}', caption: '可控性判据' },
        ],
        resources: [
          { title: 'Feedback Systems: An Introduction for Scientists and Engineers', by: 'Åström & Murray', url: 'https://fbswiki.org/', kind: 'book', note: '免费 PDF，反馈控制最好的现代入门教材', primary: true },
          R.brunton('线性系统、可控性、极点配置、LQR、卡尔曼滤波一条线讲完，每集 10 分钟'),
          { title: 'Control System Lectures', by: 'Brian Douglas (YouTube)', url: 'https://www.youtube.com/user/ControlLectures/', kind: 'video', note: 'PID、Bode 图、裕度这些经典概念讲得最直观' },
          { title: 'EE263 Introduction to Linear Dynamical Systems', by: 'Stephen Boyd · Stanford', url: 'https://ee263.stanford.edu/', kind: 'course' },
        ],
        quiz: ['为什么 100 ms 的延迟会让一个原本稳定的高增益 PD 控制器振荡？', '分离原理说了什么？它为什么在非线性系统上不再严格成立？'],
      },
      {
        id: 'model-based-joint',
        title: '基于模型的关节 / 任务空间控制与力控',
        en: 'Computed Torque, Operational-Space & Impedance Control',
        hours: 25,
        summary:
          '利用动力学模型做重力补偿、计算力矩（反馈线性化），再把控制目标从关节空间搬到任务空间（末端位姿），最后学会让机器人表现得像弹簧-阻尼系统（阻抗 / 导纳控制）以安全地与环境接触。这是机械臂控制的主干。',
        points: [
          '重力补偿 PD → 计算力矩法：闭环变成线性误差动力学',
          '操作空间控制（Khatib）：任务空间惯量 Λ = (J M⁻¹ Jᵀ)⁻¹，动态一致的零空间',
          '阻抗控制 vs 导纳控制：力矩控制硬件 vs 位置控制硬件；刚度 / 阻尼的选择与稳定性',
          '力控与混合位置 / 力控制；接触过渡的稳定性问题',
          '被动性与能量整形；关节柔性（SEA）与摩擦补偿',
        ],
        formulas: [
          { latex: '\\tau = M(q)\\big(\\ddot{q}_d + K_d\\dot{e} + K_p e\\big) + C(q,\\dot q)\\dot q + g(q),\\quad e = q_d - q', caption: '计算力矩法：闭环变成 ë + K_d ė + K_p e = 0' },
          { latex: 'F = \\Lambda(q)\\,\\ddot x^{*} + \\mu(q,\\dot q) + p(q),\\qquad \\tau = J^{\\top}F + (I - J^{\\top}\\bar J^{\\top})\\,\\tau_0', caption: '操作空间控制与动态一致零空间' },
        ],
        resources: [
          R.mr('第 11 章 Robot Control', '关节控制、计算力矩、力控与阻抗控制'),
          { title: 'CS223A Introduction to Robotics（控制部分）', by: 'Oussama Khatib · Stanford', url: 'https://see.stanford.edu/Course/CS223A', kind: 'course', note: '操作空间控制的发明者亲授', primary: true },
          R.manipulation('Ch. Force Control', 'https://manipulation.csail.mit.edu/force.html', '阻抗控制、混合力位控制的现代讲法'),
          { title: 'TSID — Task Space Inverse Dynamics', by: 'Del Prete 等 · LAAS', url: 'https://github.com/stack-of-tasks/tsid', kind: 'tool', note: '基于 Pinocchio 的任务空间逆动力学库' },
        ],
        quiz: ['计算力矩法要求模型精确，模型误差 10% 时闭环会怎样？', '阻抗控制与导纳控制的区别是什么？各适合什么硬件？'],
        papers: ['impedance', 'force control'],
      },
      {
        id: 'nonlinear-safety',
        title: '非线性控制与安全关键控制',
        en: 'Nonlinear, Adaptive & Safety-Critical Control',
        hours: 25,
        summary:
          '线性化只在工作点附近有效。李雅普诺夫理论给出非线性系统稳定性的通用语言；反馈线性化、滑模、反步法是经典设计工具；控制屏障函数（CBF）把安全约束写成可在线求解的 QP；自适应控制与 L1 自适应则处理未知参数。双足的混合零动力学（HZD）是把这些组合起来的漂亮案例。',
        points: [
          '李雅普诺夫稳定性、LaSalle 不变集、区域吸引域（RoA）估计',
          '反馈线性化与零动力学；滑模与鲁棒性；反步法',
          '控制李雅普诺夫函数（CLF）与控制屏障函数（CBF）：把稳定与安全写成 QP 约束——安全滤波器',
          '自适应控制、L1 自适应、基于学习的残差补偿（Neural-Fly）',
          '混合零动力学（HZD）：虚拟约束驱动的双足步态设计',
        ],
        formulas: [
          { latex: 'V(x) > 0,\\;\\; \\dot V(x) = \\nabla V^{\\top} f(x,u) < 0\\quad\\Rightarrow\\quad \\text{渐近稳定}', caption: '李雅普诺夫直接法' },
          { latex: 'u^{*} = \\arg\\min_u \\|u - u_{\\text{nom}}\\|^2\\;\\text{ s.t. } \\nabla h(x)^{\\top}\\big(f(x)+g(x)u\\big) \\ge -\\alpha\\, h(x)', caption: 'CBF 安全滤波器 QP' },
        ],
        resources: [
          R.underactuated('Ch. Lyapunov Analysis', 'https://underactuated.mit.edu/lyapunov.html', '李雅普诺夫、SOS 验证、区域吸引域', ),
          { title: 'Control Barrier Functions: Theory and Applications', by: 'Ames 等 · ECC 2019', url: 'https://arxiv.org/abs/1903.11199', kind: 'paper', note: 'CBF 的标准教程', primary: true },
          { title: 'Feedback Control of a Cassie Bipedal Robot', by: 'Gong 等 · Grizzle Lab', url: 'https://arxiv.org/abs/1809.07279', kind: 'paper', note: 'HZD 与虚拟约束在真机上的完整案例' },
          { title: 'Neural-Fly Enables Rapid Learning for Agile Flight in Strong Winds', by: "O'Connell, Shi 等 · Science Robotics 2022", url: 'https://arxiv.org/abs/2205.06908', kind: 'paper', note: '自适应控制 + 学习残差的现代结合' },
        ],
        quiz: ['CBF 的参数 α 变大 / 变小分别意味着什么？', '反馈线性化后的零动力学不稳定会有什么后果？'],
        papers: ['safety', 'barrier function', 'adaptive control'],
      },
      {
        id: 'lqr-dp',
        title: 'LQR、动态规划与 HJB',
        en: 'LQR, Dynamic Programming & HJB',
        hours: 25,
        summary:
          '最优控制把「控制器设计」变成「写代价函数」。LQR 是唯一有闭式解的最优控制问题，也是理解一切的锚点；动态规划（贝尔曼方程）给出最优性的原理，同时是强化学习的数学起点。',
        points: [
          '代价函数、贝尔曼最优性原理、值函数 / 代价到达函数 J*(x)',
          '离散 LQR：向后递推 Riccati 方程，得到线性反馈 u = −Kx；无限时域 LQR 与代数 Riccati 方程',
          '时变 LQR（TVLQR）沿轨迹稳定非线性系统；LQR 与可控性、鲁棒性的联系',
          'HJB 方程（连续时间）与 Pontryagin 极小值原理；值迭代在网格上求解低维问题',
          '随机 LQR / LQG：加噪声后为什么最优控制律不变（分离原理）',
        ],
        formulas: [
          { latex: 'J = \\sum_{k=0}^{N-1} \\big(x_k^{\\top}Qx_k + u_k^{\\top}Ru_k\\big) + x_N^{\\top}Q_N x_N,\\qquad u_k = -K_k x_k', caption: '离散时间 LQR' },
          { latex: 'P_k = Q + A^{\\top}P_{k+1}A - A^{\\top}P_{k+1}B\\,(R + B^{\\top}P_{k+1}B)^{-1}B^{\\top}P_{k+1}A', caption: 'Riccati 向后递推' },
          { latex: 'J^{*}(x) = \\min_u \\big[\\,\\ell(x,u) + J^{*}(f(x,u))\\,\\big]', caption: '贝尔曼方程（动态规划）' },
        ],
        resources: [
          R.underactuated('Ch. Dynamic Programming & Ch. LQR', 'https://underactuated.mit.edu/dp.html'),
          R.cmu745('Lectures 7–9: Pontryagin, LQR in 3 Ways, DP', '同一个 LQR 用三种方法推导，非常好的思维训练'),
          { title: 'AA203 Optimal and Learning-Based Control（讲义）', by: 'Marco Pavone · Stanford', url: 'https://stanfordasl.github.io/aa203/', kind: 'notes', note: '从最优控制到学习控制的完整讲义，数学严谨', primary: true },
          { title: 'Reinforcement Learning and Optimal Control（讲义与视频）', by: 'Dimitri Bertsekas · ASU / MIT', url: 'https://web.mit.edu/dimitrib/www/RLbook.html', kind: 'notes', note: '动态规划大师把 DP 与 RL 统一起来讲' },
        ],
        quiz: ['为什么 LQR 的最优控制律是线性的、且与初始状态无关？', '动态规划的「维数灾难」具体指什么？MPC 和 RL 分别如何绕开它？'],
      },
      {
        id: 'trajopt',
        title: '轨迹优化：直接法、DDP / iLQR',
        en: 'Trajectory Optimization',
        hours: 30,
        summary:
          '当系统非线性、有约束、维数高时，闭式解不存在，就把「找一条最优轨迹」写成非线性规划来求解。直接法（打靶 / 配点）把整条轨迹当决策变量交给 NLP 求解器；DDP / iLQR 则利用动态规划的结构做高效的二阶迭代。这是现代足式与操作机器人运动生成的核心工具。',
        points: [
          '直接法：直接打靶（single shooting）、多重打靶、直接配点（direct collocation）；转录成 NLP 用 IPOPT / SNOPT 求解',
          '间接法与 Pontryagin：伴随变量、为什么工程上更常用直接法',
          'DDP / iLQR：沿名义轨迹向后传递值函数二次近似，向前滚动更新；线搜索与正则化',
          '处理约束：惩罚、增广拉格朗日（ALTRO）、带约束的 iLQR；接触隐式轨迹优化',
          '轨迹优化 + TVLQR = 开环规划 + 闭环稳定的经典组合',
        ],
        formulas: [
          { latex: '\\min_{x_{0:N},\\,u_{0:N-1}} \\sum_{k=0}^{N-1}\\ell(x_k,u_k) + \\ell_N(x_N)\\quad\\text{s.t. } x_{k+1} = f(x_k,u_k),\\; x_0 = \\bar x_0,\\; c(x_k,u_k) \\le 0', caption: '离散时间轨迹优化（直接转录）' },
          { latex: '\\delta u_k^{*} = -Q_{uu}^{-1}\\big(Q_u + Q_{ux}\\,\\delta x_k\\big) = k_k + K_k\\,\\delta x_k', caption: 'DDP / iLQR 的向后传递给出前馈 k 与反馈 K' },
        ],
        resources: [
          R.underactuated('Ch. Trajectory Optimization', 'https://underactuated.mit.edu/trajopt.html'),
          R.cmu745('Lectures 11–13: Nonlinear TrajOpt, DDP, Direct Methods', '配套 Julia notebook 可以跑：github.com/Optimal-Control-16-745/lecture-notebooks'),
          { title: 'An Introduction to Trajectory Optimization: How to Do Your Own Direct Collocation', by: 'Matthew Kelly · SIAM Review', url: 'https://www.matthewpeterkelly.com/tutorials/trajectoryOptimization/index.html', kind: 'paper', note: '最友好的直接配点教程（交互式教程 + 论文 PDF + OptimTraj 代码）', primary: true },
          { title: 'Synthesis and Stabilization of Complex Behaviors through Online Trajectory Optimization', by: 'Tassa, Erez, Todorov · IROS 2012', url: 'https://homes.cs.washington.edu/~todorov/papers/TassaIROS12.pdf', kind: 'paper', note: 'iLQR 用于全身控制的经典论文' },
          { title: 'Crocoddyl', by: 'LAAS-CNRS / INRIA', url: 'https://github.com/loco-3d/crocoddyl', kind: 'tool', note: '基于 Pinocchio 的 DDP 求解器，足式 / 操作示例齐全' },
          { title: 'CasADi', by: 'Andersson 等', url: 'https://web.casadi.org/', kind: 'tool', note: '符号建模 + 自动微分 + IPOPT，写直接配点最方便的工具' },
        ],
        quiz: ['直接配点为什么比单打靶数值上更稳定？代价是什么？', 'iLQR 与 DDP 的区别在哪一项？为什么 iLQR 通常够用？'],
        papers: ['trajectory optimization'],
      },
      {
        id: 'mpc',
        title: '模型预测控制（MPC）',
        en: 'Model Predictive Control',
        hours: 30,
        summary:
          'MPC 的思想极简：每个控制周期在线求解一个有限时域轨迹优化，只执行第一步，下一周期重来。它天然处理约束、能利用最新状态估计，是当今四足 / 人形机器人（MIT Cheetah、ANYmal、Atlas）运动控制的骨干。',
        points: [
          '滚动时域原理、稳定性与可行性（终端代价 / 终端约束）、鲁棒 MPC 与管道 MPC 概览',
          '线性 / 凸 MPC：写成 QP，用 OSQP / qpOASES 在 kHz 级实时求解；显式 MPC',
          '非线性 MPC：实时迭代（RTI）、SQP 只做一步、acados / OCS2 等框架；warm start 的重要性',
          '足式机器人 MPC：SRBD 凸 MPC（Cheetah 3）、质心 + 全身运动学 NMPC（ANYmal / OCS2）、感知地形 MPC',
          'MPC 与学习的结合：学习代价函数、学习动力学残差、把策略当作 warm start 或终端值函数',
        ],
        formulas: [
          { latex: '\\min_{u_{0:N-1}} \\sum_{k=0}^{N-1} \\|x_k - x_k^{\\text{ref}}\\|_Q^2 + \\|u_k\\|_R^2\\;\\text{ s.t. } x_{k+1} = Ax_k + Bu_k,\\; u\\in\\mathcal U,\\; x\\in\\mathcal X;\\quad\\text{执行 } u_0^{*}', caption: '线性 MPC：每步求解一个 QP，只执行第一步' },
        ],
        resources: [
          { title: 'Model Predictive Control: Theory, Computation, and Design (2nd ed.)', by: 'Rawlings, Mayne, Diehl', url: 'https://sites.engineering.ucsb.edu/~jbraw/mpc/', kind: 'book', note: '免费 PDF，MPC 理论最权威的教材，第 1–2 章建立框架', primary: true },
          { title: 'Predictive Control for Linear and Hybrid Systems', by: 'Borrelli, Bemporad, Morari', url: 'https://cse.lab.imtlucca.it/~bemporad/publications/papers/BBMbook.pdf', kind: 'book', note: '作者提供的免费 PDF，凸 MPC 与显式 MPC' },
          R.cmu745('Lecture 10: Convex MPC；Lecture 20: How to Walk'),
          { title: 'Dynamic Locomotion in the MIT Cheetah 3 Through Convex MPC', by: 'Di Carlo 等 · IROS 2018', url: 'https://dspace.mit.edu/handle/1721.1/138000', kind: 'paper', note: '四足凸 MPC 的奠基论文，开源实现见 mit-biomimetics/Cheetah-Software' },
          { title: 'Perceptive Locomotion through Nonlinear MPC', by: 'Grandia 等 · T-RO 2023', url: 'https://arxiv.org/abs/2208.08373', kind: 'paper', note: 'ANYmal 的感知非线性 MPC，配套开源框架 OCS2' },
          { title: 'acados', by: 'Verschueren, Frison 等 · Freiburg', url: 'https://docs.acados.org/', kind: 'tool', note: '嵌入式实时非线性 MPC 求解器，Python 接口友好' },
          { title: 'OCS2', by: 'ETH RSL', url: 'https://github.com/leggedrobotics/ocs2', kind: 'tool', note: 'ANYmal 用的 NMPC 工具箱（SLQ / DDP / SQP）' },
        ],
        quiz: ['为什么 MPC 只执行第一步就重解？它相比一次性轨迹优化 + TVLQR 的优势和代价各是什么？', '四足机器人为什么可以用单刚体模型做 MPC 而忽略腿的动力学？'],
        papers: ['mpc', 'model predictive'],
      },
      {
        id: 'wbc',
        title: '全身控制（WBC）与分层 QP',
        en: 'Whole-Body Control & Hierarchical QP',
        hours: 20,
        summary:
          '全身控制在 500 Hz–1 kHz 下把 MPC 输出的质心 / 末端期望转换成每个关节的力矩：以全身动力学为等式约束，接触摩擦锥与力矩限制为不等式约束，把多个任务按优先级（严格分层或加权）写成 QP 求解。它是「简化模型规划 → 真机关节」之间的关键一层。',
        points: [
          '任务的定义：加速度级 / 力级任务，Jẍ 形式；接触约束 J_c q̈ + J̇_c q̇ = 0',
          '加权 QP vs 严格分层 QP（零空间投影 / 级联 QP）；优先级设计的经验',
          '接触力分配：摩擦锥、单边约束、内力最小化；力矩 / 关节限位',
          '与 MPC 的分工：MPC 给参考轨迹与接触力，WBC 负责一致性与瞬时约束',
          '实现细节：求解器选择（qpOASES / OSQP / ProxQP）、热启动、kHz 级时序',
        ],
        formulas: [
          { latex: '\\min_{\\ddot q,\\,\\lambda,\\,\\tau}\\; \\sum_i w_i\\|J_i\\ddot q + \\dot J_i\\dot q - \\ddot x_i^{d}\\|^2\\;\\text{ s.t. } M\\ddot q + h = S^{\\top}\\tau + J_c^{\\top}\\lambda,\\; \\lambda\\in\\mathcal{K}_\\mu,\\; |\\tau|\\le\\tau_{\\max}', caption: '加权全身控制 QP' },
        ],
        resources: [
          { title: 'Momentum Control with Hierarchical Inverse Dynamics on a Torque-Controlled Humanoid', by: 'Herzog 等 · Autonomous Robots 2016', url: 'https://arxiv.org/abs/1410.7284', kind: 'paper', note: '分层逆动力学 WBC 的清晰阐述', primary: true },
          { title: 'Hierarchical Quadratic Programming', by: 'Escande, Mansard, Wieber · IJRR 2014', url: 'https://hal.science/hal-00751924', kind: 'paper', note: '严格分层 QP 的高效求解' },
          { title: 'Cheetah-Software（WBC 模块）', by: 'MIT Biomimetic Robotics Lab', url: 'https://github.com/mit-biomimetics/Cheetah-Software', kind: 'tool', note: 'MPC + WBC 的完整开源工程实现' },
          { title: 'TSID', by: 'LAAS', url: 'https://github.com/stack-of-tasks/tsid', kind: 'tool' },
        ],
        quiz: ['为什么 WBC 要把全身动力学作为等式约束而不是直接用计算力矩法？', '严格分层与加权 QP 各自的优缺点？'],
        papers: ['whole-body control', 'humanoid'],
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'planning',
    emoji: '🗺️',
    title: '运动规划',
    en: 'Motion Planning',
    tagline: '构型空间、图搜索、采样规划、优化规划、任务与运动规划。',
    intro:
      '控制解决「如何跟随一条轨迹」，规划解决「这条轨迹从哪来」。在高维构型空间里避开障碍找到可行路径，是图搜索、随机采样（RRT / PRM）与优化规划（CHOMP / TrajOpt）的领地；再往上是时间参数化、动力学可行性、不确定性下的规划和任务级规划。',
    outcomes: ['能为机械臂配置 OMPL / MoveIt 并理解每个参数', '能实现 A* / RRT* 并分析其性质', '能把避障写进轨迹优化', '理解 TAMP 与 LLM 规划如何与底层运动规划衔接'],
    prereq: ['modeling'],
    topics: [
      {
        id: 'cspace-search',
        title: '构型空间与图搜索',
        en: 'Configuration Space & Graph Search',
        hours: 15,
        summary:
          '把机器人抽象成构型空间中的一个点，障碍物映射成 C-障碍，规划就成了在高维空间找路。低维问题可以离散化成图，用 Dijkstra / A* 及其增量、任意时间变体求解；这也是导航栅格规划和足步规划的基础。',
        points: [
          '构型空间 C、C-障碍、自由空间；碰撞检测（FCL、GJK、BVH）是规划器的主要开销',
          'Dijkstra、A*、加权 A*、ARA*（任意时间）、D* Lite（增量重规划）',
          '格点 / 状态栅格（lattice）规划，运动基元；导航中的代价地图',
          '足步规划：把行走当离散搜索或混合整数优化',
        ],
        formulas: [{ latex: 'f(n) = g(n) + h(n),\\qquad h \\text{ 可采纳}\\;(h \\le h^{*})\\Rightarrow A^{*}\\text{ 最优}', caption: 'A* 的评价函数与最优性条件' }],
        resources: [
          { title: 'Planning Algorithms（第 2 章离散规划，第 4 章构型空间）', by: 'Steven LaValle · UIUC', url: 'http://lavalle.pl/planning/', kind: 'book', note: '免费在线全书', primary: true },
          { title: '16-782 Planning & Decision-making in Robotics', by: 'Maxim Likhachev · CMU', url: 'https://www.cs.cmu.edu/~maxim/classes/robotplanning/', kind: 'course', note: '搜索式规划最系统的课程，讲义公开' },
          { title: 'D* Lite', by: 'Koenig & Likhachev · AAAI 2002', url: 'http://idm-lab.org/bib/abstracts/papers/aaai02b.pdf', kind: 'paper' },
          { title: 'Footstep Planning on Uneven Terrain with Mixed-Integer Convex Optimization', by: 'Deits & Tedrake · Humanoids 2014', url: 'https://groups.csail.mit.edu/robotics-center/public_papers/Deits14a.pdf', kind: 'paper' },
        ],
        quiz: ['启发式不可采纳时 A* 会失去什么？加权 A* 为什么仍然有用？', '为什么 7 自由度机械臂不能直接用栅格 A*？'],
      },
      {
        id: 'sampling-planning',
        title: '采样规划：PRM、RRT 与渐近最优',
        en: 'Sampling-Based Planning',
        hours: 20,
        summary:
          '高维空间里显式构造自由空间不可行，随机采样 + 局部连接是实用解：PRM 建图多次查询，RRT 单次查询快速探索，RRT* / PRM* 通过重连获得渐近最优。理解概率完备性与 Voronoi 偏置，就能理解为什么它们在 7–30 维上仍然可用。',
        points: [
          'PRM 与 RRT 的基本循环；采样、最近邻（kd-tree）、局部规划器',
          '概率完备、Voronoi 偏置、窄通道问题与改进采样（高斯、桥采样）',
          'RRT-Connect（双向）、RRT*、PRM*、Informed RRT*、BIT*：渐近最优的代价',
          '运动学 / 动力学约束下的规划（kinodynamic RRT、SST）；约束流形上的规划',
          '路径后处理：捷径、平滑；OMPL / MoveIt 的实际使用',
        ],
        resources: [
          { title: 'Planning Algorithms（第 5 章 Sampling-Based Motion Planning）', by: 'Steven LaValle', url: 'http://lavalle.pl/planning/', kind: 'book', primary: true },
          { title: 'Sampling-based Algorithms for Optimal Motion Planning', by: 'Karaman & Frazzoli · IJRR 2011', url: 'https://arxiv.org/abs/1105.1186', kind: 'paper', note: 'RRT* / PRM* 原始论文' },
          R.mr('第 10 章 Motion Planning', '一章讲清 C-空间、A*、RRT、势场法'),
          R.manipulation('Ch. Motion Planning', 'https://manipulation.csail.mit.edu/trajectories.html', '采样规划 + 优化规划 + Drake 示例'),
          { title: 'OMPL — Open Motion Planning Library', by: 'Kavraki Lab · Rice', url: 'https://ompl.kavrakilab.org/', kind: 'tool', note: '几十种采样规划器的参考实现，MoveIt 的后端' },
          { title: 'MoveIt 2', by: 'PickNik / ROS 社区', url: 'https://moveit.picknik.ai/', kind: 'tool', note: '机械臂规划的事实标准栈' },
        ],
        quiz: ['RRT 为什么天然偏向探索未访问区域（Voronoi bias）？', 'RRT* 与 RRT 相比多做了哪两步？为什么因此渐近最优？'],
        papers: ['motion planning'],
      },
      {
        id: 'optimization-planning',
        title: '优化规划与轨迹生成',
        en: 'Optimization-Based Planning & Trajectory Generation',
        hours: 20,
        summary:
          '把碰撞代价光滑化后，规划可以直接做梯度下降（CHOMP / STOMP / TrajOpt），得到平滑、局部最优的轨迹；再用多项式 / B 样条与时间最优参数化（TOPP-RA）生成满足速度 / 加速度限制的可执行轨迹。四旋翼的最小 snap 轨迹与微分平坦性是这一思路的经典应用。',
        points: [
          'CHOMP（协变梯度、有符号距离场）、STOMP（随机）、TrajOpt（序列凸优化 + 凸包碰撞约束）',
          '样条与多项式轨迹：三次 / 五次多项式、B 样条、最小 snap；微分平坦性让四旋翼规划变成几何问题',
          '时间参数化：TOPP / TOPP-RA 在给定路径上求时间最优速度曲线',
          '规划、轨迹优化与 MPC 的分工：全局路径 → 局部轨迹 → 实时跟踪',
        ],
        formulas: [
          { latex: '\\min_\\xi\\; \\mathcal{F}_{\\text{smooth}}(\\xi) + \\lambda\\,\\mathcal{F}_{\\text{obs}}(\\xi),\\qquad \\xi_{k+1} = \\xi_k - \\eta\\,A^{-1}\\nabla\\mathcal{F}', caption: 'CHOMP：协变梯度下降' },
        ],
        resources: [
          { title: 'CHOMP: Gradient Optimization Techniques for Efficient Motion Planning', by: 'Ratliff, Zucker, Bagnell, Srinivasa · ICRA 2009', url: 'https://www.ri.cmu.edu/pub_files/2009/5/icra09-chomp.pdf', kind: 'paper', primary: true },
          { title: 'Motion Planning with Sequential Convex Optimization and Convex Collision Checking (TrajOpt)', by: 'Schulman 等 · IJRR 2014', url: 'http://joschu.net/docs/trajopt-paper.pdf', kind: 'paper' },
          { title: 'Polynomial Trajectory Planning for Aggressive Quadrotor Flight', by: 'Richter, Bry, Roy · ISRR 2013', url: 'https://groups.csail.mit.edu/rrg/papers/Richter_ISRR13.pdf', kind: 'paper', note: '最小 snap + 微分平坦 + RRT* 的组合' },
          { title: 'A New Approach to Time-Optimal Path Parameterization (TOPP-RA)', by: 'Pham & Pham · T-RO 2018', url: 'https://arxiv.org/abs/1707.07239', kind: 'paper', note: '开源库 toppra' },
        ],
        quiz: ['为什么 CHOMP 需要有符号距离场？它在窄通道中会遇到什么问题？', '微分平坦性为什么能把四旋翼的轨迹规划简化为对位置多项式的优化？'],
        papers: ['trajectory generation', 'quadrotor'],
      },
      {
        id: 'tamp-uncertainty',
        title: '不确定性下的规划与任务-运动规划（TAMP）',
        en: 'Planning under Uncertainty & Task and Motion Planning',
        hours: 15,
        summary:
          '真实世界状态不完全可观、动作会失败，长时程任务需要在符号层（先拿杯子再倒水）与几何层（怎么抓、走哪条路）之间来回。POMDP / 信念空间规划处理不确定性，TAMP 把符号规划与运动规划耦合，近年 LLM / VLM 又被用作高层规划器。',
        points: [
          'MDP → POMDP，信念状态与信念空间规划；在线 POMDP 求解（POMCP、DESPOT）',
          '任务规划：PDDL 与启发式搜索；TAMP 的接口（可行性检查、几何约束回传）',
          'LLM / VLM 作为任务规划器（SayCan、Code as Policies）及其与底层技能库的组合',
          '行为树与状态机：工程上组织长时程行为的标准工具',
        ],
        resources: [
          { title: 'Algorithms for Decision Making', by: 'Kochenderfer, Wheeler, Wray · MIT Press', url: 'https://algorithmsbook.com/', kind: 'book', note: '免费 PDF：MDP、POMDP、多智能体决策', primary: true },
          { title: 'Integrated Task and Motion Planning', by: 'Garrett 等 · Annual Review 2021', url: 'https://arxiv.org/abs/2010.01083', kind: 'paper', note: 'TAMP 权威综述' },
          { title: 'Behavior Trees in Robotics and AI: An Introduction', by: 'Colledanchise & Ögren', url: 'https://arxiv.org/abs/1709.00084', kind: 'book', note: '免费全书' },
          { title: 'Do As I Can, Not As I Say (SayCan)', by: 'Ahn 等 · Google 2022', url: 'https://arxiv.org/abs/2204.01691', kind: 'paper', note: 'LLM 任务规划 + 技能可行性的代表工作' },
        ],
        quiz: ['为什么 POMDP 精确求解不可行？在线求解器用了什么近似？', 'TAMP 里几何不可行时如何反馈给符号规划器？'],
        papers: ['task planning', 'llm', 'agent'],
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'rl',
    emoji: '🧠',
    title: '强化学习与机器人学习',
    en: 'Reinforcement Learning & Robot Learning',
    tagline: '从贝尔曼方程到 PPO、世界模型、离线 RL、模仿学习与 VLA。',
    intro:
      '当模型不准、接触复杂或任务难以写成代价函数时，从数据中学习策略成为主流。RL 与最优控制共享同一套数学（MDP、贝尔曼方程、值函数），区别在于用采样代替模型。这一模块从表格 RL 到深度 RL、基于模型的 RL 与世界模型、离线 RL，再到机器人上真正好用的两条路：大规模并行仿真训练，以及模仿学习 / 视觉-语言-动作（VLA）模型。',
    outcomes: ['能从零实现 PPO 并在 MuJoCo 上训练', '理解 RL 与最优控制的对应关系', '能用 legged_gym / Isaac Lab 训练四足 / 人形策略并知道每个奖励项为什么存在', '能读懂并复现 ACT / Diffusion Policy / VLA 论文'],
    prereq: ['control'],
    topics: [
      {
        id: 'rl-basics',
        title: 'MDP、值函数与经典强化学习',
        en: 'MDPs, Value Functions & Tabular RL',
        hours: 30,
        summary:
          '马尔可夫决策过程（MDP）是 RL 的问题定义，贝尔曼方程是它的结构。先在离散小问题上理解策略评估、策略迭代、值迭代，再理解不需要模型的蒙特卡洛与时序差分（TD）学习、Q-learning 与 SARSA，以及探索-利用权衡。',
        points: [
          'MDP 五元组 (S, A, P, R, γ)，回报、策略、状态值 V^π 与动作值 Q^π',
          '贝尔曼期望方程与贝尔曼最优方程；策略迭代 / 值迭代与最优控制里 DP 的一一对应',
          '无模型方法：蒙特卡洛、TD(0)、SARSA、Q-learning；on-policy vs off-policy',
          '函数逼近与「致命三要素」（bootstrapping + off-policy + 函数逼近）为何不稳定',
          '探索：ε-greedy、UCB、内在奖励',
        ],
        formulas: [
          { latex: 'Q^{*}(s,a) = \\mathbb{E}\\big[\\,r + \\gamma \\max_{a\'} Q^{*}(s\',a\')\\,\\big|\\,s,a\\big]', caption: '贝尔曼最优方程' },
          { latex: 'Q(s,a) \\leftarrow Q(s,a) + \\alpha\\big[r + \\gamma\\max_{a\'}Q(s\',a\') - Q(s,a)\\big]', caption: 'Q-learning 更新' },
        ],
        resources: [
          { title: 'Reinforcement Learning: An Introduction (2nd ed.)', by: 'Sutton & Barto', url: 'http://incompleteideas.net/book/the-book-2nd.html', kind: 'book', note: '免费 PDF，RL 的圣经，第 1–7 章', primary: true },
          { title: 'RL Course by David Silver', by: 'David Silver · UCL / DeepMind', url: 'https://www.davidsilver.uk/teaching/', kind: 'video', note: '10 讲视频 + 幻灯片，与 Sutton & Barto 配套最好' },
          { title: 'CS234: Reinforcement Learning', by: 'Emma Brunskill · Stanford', url: 'https://web.stanford.edu/class/cs234/', kind: 'course', note: '讲义与作业公开，理论更严谨' },
        ],
        quiz: ['值迭代与 LQR 的 Riccati 递推有什么共同点？', '为什么 Q-learning 是 off-policy 而 SARSA 是 on-policy？'],
      },
      {
        id: 'deep-rl',
        title: '深度强化学习：策略梯度与 Actor-Critic',
        en: 'Deep RL: Policy Gradients & Actor-Critic',
        hours: 40,
        summary:
          '连续动作空间的机器人控制主要靠策略梯度家族：REINFORCE → 加基线 → Actor-Critic → TRPO / PPO；以及 off-policy 的 DDPG / TD3 / SAC。理解方差-偏差权衡、优势函数估计（GAE）、以及为什么 PPO 成了机器人仿真训练的默认选择。',
        points: [
          '策略梯度定理、REINFORCE、基线与优势函数 A(s,a) = Q − V 降低方差',
          'Actor-Critic、GAE(λ)；自然梯度 / TRPO → PPO 的裁剪目标',
          'Off-policy 连续控制：DDPG、TD3、SAC（最大熵）；重放缓冲与样本效率',
          '实现细节决定成败：观测 / 奖励归一化、优势归一化、学习率与熵系数、并行环境、随机种子的方差',
          '评估方法论：多个种子、置信区间、不要只看训练曲线',
        ],
        formulas: [
          { latex: '\\nabla_\\theta J(\\theta) = \\mathbb{E}_{\\pi_\\theta}\\Big[\\sum_t \\nabla_\\theta \\log \\pi_\\theta(a_t\\mid s_t)\\,\\hat A_t\\Big]', caption: '策略梯度定理（带优势函数）' },
          { latex: 'L^{\\text{CLIP}}(\\theta) = \\mathbb{E}_t\\Big[\\min\\big(r_t(\\theta)\\hat A_t,\\;\\operatorname{clip}(r_t(\\theta),1-\\epsilon,1+\\epsilon)\\hat A_t\\big)\\Big],\\quad r_t = \\tfrac{\\pi_\\theta(a_t|s_t)}{\\pi_{\\theta_{\\text{old}}}(a_t|s_t)}', caption: 'PPO 裁剪目标' },
        ],
        resources: [
          R.cs285('Lectures 5–9: Policy Gradients, Actor-Critic, Value-Based, Advanced PG', '完整视频与作业，机器人视角的深度 RL 第一课'),
          { title: 'Spinning Up in Deep RL', by: 'OpenAI', url: 'https://spinningup.openai.com/', kind: 'notes', note: '关键论文清单 + 干净的 PyTorch 参考实现（VPG / TRPO / PPO / DDPG / TD3 / SAC）', primary: true },
          { title: 'The 37 Implementation Details of PPO', by: 'Huang 等 · ICLR Blog 2022', url: 'https://iclr-blog-track.github.io/2022/03/25/ppo-implementation-details/', kind: 'notes', note: '为什么你的 PPO 不 work：全部细节' },
          { title: 'Proximal Policy Optimization Algorithms', by: 'Schulman 等 · 2017', url: 'https://arxiv.org/abs/1707.06347', kind: 'paper' },
          { title: 'Soft Actor-Critic', by: 'Haarnoja 等 · 2018', url: 'https://arxiv.org/abs/1801.01290', kind: 'paper' },
        ],
        quiz: ['为什么减去一个只依赖状态的基线不改变策略梯度的期望，却能降低方差？', 'PPO 的裁剪在防止什么？它和 TRPO 的 KL 约束是什么关系？'],
        papers: ['reinforcement learning'],
      },
      {
        id: 'model-based-rl',
        title: '基于模型的 RL 与世界模型',
        en: 'Model-Based RL & World Models',
        hours: 25,
        summary:
          '先学一个动力学模型再用它规划或生成想象数据，样本效率比无模型方法高一到两个量级。从 PETS 的概率集成 + MPC、MBPO 的短程 rollout，到 Dreamer / TD-MPC 系列在潜空间学习世界模型，这条路线正与机器人「视频世界模型」「世界-动作模型」的前沿汇合。',
        points: [
          '模型误差与复合误差：为什么想象轨迹不能太长；不确定性感知（集成、贝叶斯）',
          '模型 + 规划：PETS（概率集成 + CEM-MPC）；模型 + 策略：MBPO（Dyna 风格短 rollout）',
          '潜空间世界模型：Dreamer 系列（RSSM、想象中训练 actor-critic）、TD-MPC2',
          '与 MPC / 最优控制的关系：学习的模型就是可微仿真器；与生成式视频模型的联系',
          '真机上的 MBRL：DayDreamer 在一小时内学会行走',
        ],
        resources: [
          R.cs285('Lectures 11–12: Model-Based RL & Policy Learning with Models'),
          { title: 'Deep RL in a Handful of Trials using Probabilistic Dynamics Models (PETS)', by: 'Chua 等 · NeurIPS 2018', url: 'https://arxiv.org/abs/1805.12114', kind: 'paper' },
          { title: 'When to Trust Your Model: Model-Based Policy Optimization (MBPO)', by: 'Janner 等 · NeurIPS 2019', url: 'https://arxiv.org/abs/1906.08253', kind: 'paper' },
          { title: 'Mastering Diverse Domains through World Models (DreamerV3)', by: 'Hafner 等 · 2023', url: 'https://arxiv.org/abs/2301.04104', kind: 'paper', primary: true },
          { title: 'TD-MPC2: Scalable, Robust World Models for Continuous Control', by: 'Hansen, Su, Wang · ICLR 2024', url: 'https://arxiv.org/abs/2310.16828', kind: 'paper' },
          { title: 'DayDreamer: World Models for Physical Robot Learning', by: 'Wu 等 · CoRL 2022', url: 'https://arxiv.org/abs/2206.14176', kind: 'paper' },
        ],
        quiz: ['为什么 MBPO 只用很短的模型 rollout？长度与模型误差的关系是什么？', 'Dreamer 里的「想象」训练与 MPC 在线规划的本质区别？'],
        papers: ['world model', 'world-action model'],
      },
      {
        id: 'offline-rl',
        title: '离线 RL 与策略微调',
        en: 'Offline RL & Policy Fine-Tuning',
        hours: 20,
        summary:
          '真机数据昂贵且危险，能否只用已有数据集学策略？离线 RL 的核心困难是分布外动作的过估计，CQL / IQL 等方法通过保守或隐式约束解决；随后再用少量在线交互微调（Cal-QL、HIL-SERL），或用 RL 微调预训练的模仿策略 / VLA。这是近两年机器人学习最活跃的方向之一。',
        points: [
          '分布偏移与 OOD 动作的价值过估计；行为正则化（BCQ、TD3+BC）',
          '保守 Q 学习（CQL）、隐式 Q 学习（IQL）、决策 Transformer',
          '离线到在线：Cal-QL 校准、混合缓冲；人在环 RL（HIL-SERL）在真机上一两小时学会任务',
          '用 RL 微调模仿学习策略 / VLA：优势加权、PPO 微调、成功检测器作为奖励',
        ],
        resources: [
          { title: 'Offline Reinforcement Learning: Tutorial, Review, and Perspectives', by: 'Levine, Kumar, Tucker, Fu · 2020', url: 'https://arxiv.org/abs/2005.01643', kind: 'paper', note: '离线 RL 综述教程', primary: true },
          R.cs285('Lectures 15–16: Offline RL'),
          { title: 'Conservative Q-Learning (CQL)', by: 'Kumar 等 · NeurIPS 2020', url: 'https://arxiv.org/abs/2006.04779', kind: 'paper' },
          { title: 'Offline RL with Implicit Q-Learning (IQL)', by: 'Kostrikov, Nair, Levine · ICLR 2022', url: 'https://arxiv.org/abs/2110.06169', kind: 'paper' },
          { title: 'Cal-QL: Calibrated Offline RL Pre-Training for Efficient Online Fine-Tuning', by: 'Nakamoto 等 · NeurIPS 2023', url: 'https://arxiv.org/abs/2303.05479', kind: 'paper' },
          { title: 'Precise and Dexterous Robotic Manipulation via Human-in-the-Loop RL (HIL-SERL)', by: 'Luo 等 · 2024', url: 'https://arxiv.org/abs/2410.21845', kind: 'paper', note: '开源 serl 框架，真机 RL 的实用配方' },
        ],
        quiz: ['为什么普通 Q-learning 在离线数据上会发散？CQL 的正则项在做什么？', '离线预训练的 Q 函数为什么在在线微调初期会「掉」？Cal-QL 如何避免？'],
        papers: ['offline rl', 'fine-tuning'],
      },
      {
        id: 'rl-locomotion',
        title: 'RL 运动控制实战：奖励、课程与教师-学生',
        en: 'RL for Locomotion & Whole-Body Control in Practice',
        hours: 30,
        summary:
          '2019 年后，四足 / 人形机器人的运动控制被「GPU 上数千个并行环境 + PPO + 域随机化 + 教师-学生蒸馏」这套配方彻底改变。这一节聚焦训练配方本身：观测与奖励怎么设计、课程怎么排、特权信息怎么用、如何从四足推到人形与全身控制（迁移技巧见 Sim-to-Real 模块）。',
        points: [
          '观测设计：本体感受历史、相位 / 命令输入、特权信息（地形、接触、摩擦）与非对称 actor-critic',
          '奖励塑形：任务奖励 + 正则项（力矩、动作率、脚滑、姿态）；参考运动（AMP、动作捕捉）',
          '课程学习：命令范围、地形难度、随机化范围逐步放大；对称性利用',
          '教师-学生 / 蒸馏：特权教师 → 仅本体感受学生（DAgger 式）；感知策略（深度图、高程图）',
          '从四足到人形与全身控制：动作空间设计、参考动作跟踪、上下身解耦',
          '与 MPC 对比：鲁棒性、计算成本、可解释性、约束处理；混合方法（RL 输出 MPC 参考 / 残差）',
        ],
        resources: [
          { title: 'Learning to Walk in Minutes Using Massively Parallel Deep RL', by: 'Rudin, Hoeller, Reist, Hutter · CoRL 2021', url: 'https://arxiv.org/abs/2109.11978', kind: 'paper', note: '配套开源 legged_gym + rsl_rl，是大多数后续工作的代码起点', primary: true },
          { title: 'Learning Quadrupedal Locomotion over Challenging Terrain', by: 'Lee 等 · Science Robotics 2020', url: 'https://arxiv.org/abs/2010.11251', kind: 'paper', note: '教师-学生 + 地形课程' },
          { title: 'Walk These Ways: Tuning Robot Control for Generalization with Multiplicity of Behavior', by: 'Margolis & Agrawal · CoRL 2022', url: 'https://arxiv.org/abs/2212.03238', kind: 'paper', note: '奖励与行为参数化设计的好教材，代码开源' },
          { title: 'Extreme Parkour with Legged Robots', by: 'Cheng 等 · 2023', url: 'https://arxiv.org/abs/2309.14341', kind: 'paper', note: '感知策略 + 蒸馏的代表' },
          { title: 'Expressive Whole-Body Control for Humanoid Robots', by: 'Cheng 等 · RSS 2024', url: 'https://arxiv.org/abs/2402.16796', kind: 'paper', note: '人形全身控制的 RL 配方' },
          { title: 'legged_gym', by: 'ETH RSL', url: 'https://github.com/leggedrobotics/legged_gym', kind: 'tool' },
          { title: 'unitree_rl_gym', by: 'Unitree', url: 'https://github.com/unitreerobotics/unitree_rl_gym', kind: 'tool', note: 'Go2 / G1 的开源训练 + 部署示例' },
        ],
        quiz: ['非对称 actor-critic 为什么允许 critic 看特权信息而 actor 不能？', '动作率惩罚项在真机上防止的是什么问题？'],
        papers: ['locomotion', 'humanoid', 'sim-to-real'],
      },
      {
        id: 'imitation-vla',
        title: '模仿学习、扩散策略与视觉-语言-动作模型',
        en: 'Imitation Learning, Diffusion Policy & VLA',
        hours: 30,
        summary:
          '操作任务奖励难写、探索危险，因此从人类示教中学习成为主流。从行为克隆（BC）与 DAgger 出发，到动作分块（ACT）、扩散策略（Diffusion Policy），再到在互联网规模数据上预训练的视觉-语言-动作模型（RT-2、OpenVLA、π0），这条线正是本站每日推荐里最活跃的方向。',
        points: [
          '行为克隆与协变量偏移（compounding error）；DAgger 的交互式修正',
          '多模态动作分布：为什么 MSE 回归会失败，能量模型 / 扩散 / 流匹配如何建模',
          '动作分块与时间集成（ACT）；Diffusion Policy 的去噪动作生成',
          'VLA：把预训练视觉-语言模型微调成策略；动作离散化 vs 连续动作头（flow matching）；跨本体数据集（Open X-Embodiment）',
          '数据采集：遥操作（ALOHA、GELLO）、人类视频、仿真合成数据；评估的难点',
        ],
        resources: [
          R.cs285('Lectures 2–3: Behavioral Cloning', 'BC、DAgger、协变量偏移的理论'),
          R.manipulation('Reinforcement Learning & Imitation 章节', 'https://manipulation.csail.mit.edu/rl.html', '从控制视角看行为克隆与扩散策略'),
          { title: 'Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware (ACT / ALOHA)', by: 'Zhao, Kumar, Levine, Finn · RSS 2023', url: 'https://arxiv.org/abs/2304.13705', kind: 'paper' },
          { title: 'Diffusion Policy: Visuomotor Policy Learning via Action Diffusion', by: 'Chi 等 · RSS 2023', url: 'https://arxiv.org/abs/2303.04137', kind: 'paper', primary: true },
          { title: 'Open X-Embodiment: Robotic Learning Datasets and RT-X Models', by: 'Open X-Embodiment Collaboration · 2023', url: 'https://robotics-transformer-x.github.io/', kind: 'paper' },
          { title: 'OpenVLA: An Open-Source Vision-Language-Action Model', by: 'Kim 等 · CoRL 2024', url: 'https://arxiv.org/abs/2406.09246', kind: 'paper' },
          { title: 'π0: A Vision-Language-Action Flow Model for General Robot Control', by: 'Black 等 · Physical Intelligence 2024', url: 'https://arxiv.org/abs/2410.24164', kind: 'paper' },
          { title: 'LeRobot', by: 'Hugging Face', url: 'https://github.com/huggingface/lerobot', kind: 'tool', note: '开源的数据集 / 策略（ACT、Diffusion、VLA）训练与部署库' },
        ],
        quiz: ['行为克隆的误差为什么会随时间步累积？DAgger 如何从理论上解决它？', '为什么扩散模型比高斯回归更适合表示示教动作分布？'],
        papers: ['vla', 'vision-language-action', 'imitation learning', 'diffusion'],
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'estimation',
    emoji: '📡',
    title: '状态估计与感知',
    en: 'State Estimation & Perception',
    tagline: '传感器模型、卡尔曼滤波、因子图 SLAM、视觉里程计、足式估计。',
    intro:
      '控制器和策略都假设「知道当前状态」，但传感器只给出带噪声的间接观测。状态估计就是用概率把模型预测和观测融合起来：从传感器建模与标定、卡尔曼滤波，到因子图与 SLAM、视觉里程计与感知，再到足式机器人的腿-IMU 融合。Tim Barfoot 的免费教材是这一模块的主线。',
    outcomes: ['能对 IMU / 相机建模并完成标定', '能实现 EKF / ESKF 并分析其一致性', '能用 GTSAM 搭一个 VIO / 位姿图', '理解足式机器人状态估计器的每个假设'],
    prereq: ['modeling'],
    topics: [
      {
        id: 'sensors-calibration',
        title: '传感器模型与标定',
        en: 'Sensor Models & Calibration',
        hours: 15,
        summary:
          '估计的质量上限由传感器模型决定。IMU 有偏置、随机游走与噪声（用 Allan 方差刻画）；相机有内参、畸变与曝光 / 运动模糊；编码器与力矩传感器有量化与偏移；多传感器还要做外参与时间同步。标定是真机工作的第一步，也是最常被低估的一步。',
        points: [
          'IMU 模型：加速度计 / 陀螺偏置、白噪声、偏置随机游走；Allan 方差确定噪声参数',
          '相机模型：针孔、畸变（Brown / 鱼眼），内参标定；立体与深度相机（ToF / 结构光）的误差特性',
          'LiDAR、力 / 力矩传感器、关节编码器、接触传感器的特性',
          '外参标定（相机-IMU、相机-机器人手眼、LiDAR-IMU）与时间同步（硬件触发、时间偏移估计）',
          '运动学标定：连杆参数误差与末端精度',
        ],
        formulas: [
          { latex: '\\tilde{\\omega} = \\omega + b_g + n_g,\\qquad \\dot b_g = n_{b_g},\\qquad \\tilde a = R^{\\top}(a - g) + b_a + n_a', caption: 'IMU 测量模型' },
          { latex: 's\\,\\begin{bmatrix} u \\\\ v \\\\ 1\\end{bmatrix} = K\\,[R\\;|\\;t]\\begin{bmatrix} X \\\\ Y \\\\ Z \\\\ 1\\end{bmatrix}', caption: '针孔相机投影' },
        ],
        resources: [
          { title: 'Kalibr（相机 / IMU 标定工具与 IMU 噪声模型 wiki）', by: 'ETH ASL', url: 'https://github.com/ethz-asl/kalibr', kind: 'tool', note: '相机-IMU 外参 + 时间偏移标定的标准工具，wiki 讲清 IMU 噪声模型', primary: true },
          { title: 'allan_variance_ros', by: 'Oxford Robotics Institute', url: 'https://github.com/ori-drs/allan_variance_ros', kind: 'tool', note: '从 IMU 静置数据计算 Allan 方差' },
          { title: 'Computer Vision: Algorithms and Applications (2nd ed.)', by: 'Richard Szeliski', url: 'https://szeliski.org/Book/', kind: 'book', note: '免费 PDF，第 2 章相机模型、第 11 章结构与运动' },
          R.barfoot('第 6 章 Primer on Three-Dimensional Geometry', '旋转与位姿估计的基础'),
        ],
        quiz: ['为什么 IMU 偏置必须作为状态一起估计而不能标定一次了事？', '相机-IMU 之间 5 ms 的时间偏移对 VIO 会造成什么后果？'],
      },
      {
        id: 'bayes-kalman',
        title: '贝叶斯滤波与卡尔曼滤波家族',
        en: 'Bayes Filter, KF / EKF / UKF / PF',
        hours: 30,
        summary:
          '贝叶斯滤波用「预测-更新」两步递推地维护状态的后验分布。线性高斯情形下就是卡尔曼滤波（KF）；非线性系统靠线性化（EKF）或采样（UKF、粒子滤波）。理解卡尔曼增益如何在模型与观测之间权衡，是所有后续方法的基础。',
        points: [
          '贝叶斯滤波的预测（运动模型）与更新（观测模型）两步',
          'KF：高斯下的闭式解，卡尔曼增益、创新（innovation）、协方差更新；KF 是最优线性估计器',
          'EKF：雅可比线性化，一致性问题；误差状态 EKF（ESKF）与旋转的正确处理',
          'UKF / sigma 点：不求雅可比的非线性传播；粒子滤波：非高斯、多模态；直方图滤波',
          '可观性：哪些状态从观测中「看得见」，为什么纯 IMU 无法估计绝对位置',
        ],
        formulas: [
          { latex: '\\overline{\\text{bel}}(x_t) = \\int p(x_t\\mid u_t, x_{t-1})\\,\\text{bel}(x_{t-1})\\,dx_{t-1},\\qquad \\text{bel}(x_t) = \\eta\\, p(z_t\\mid x_t)\\,\\overline{\\text{bel}}(x_t)', caption: '贝叶斯滤波：预测 → 更新' },
          { latex: 'K = \\bar P H^{\\top}(H\\bar P H^{\\top} + R)^{-1},\\quad \\hat x = \\bar x + K(z - H\\bar x),\\quad P = (I - KH)\\bar P', caption: '卡尔曼滤波更新步' },
        ],
        resources: [
          R.barfoot('第 3–4 章：线性 / 非线性高斯估计', '免费 PDF，本模块主教材'),
          { title: 'Kalman and Bayesian Filters in Python', by: 'Roger Labbe', url: 'https://github.com/rlabbe/Kalman-and-Bayesian-Filters-in-Python', kind: 'book', note: '交互式 Jupyter 教材，边跑代码边理解 KF / EKF / UKF / 粒子滤波', primary: true },
          { title: 'Mobile Sensing and Robotics（讲座视频）', by: 'Cyrill Stachniss · Bonn', url: 'https://www.ipb.uni-bonn.de/msr2-2021/', kind: 'video', note: '贝叶斯滤波、EKF、粒子滤波、SLAM 完整视频课' },
          R.brunton('把 KF 讲成 LQR 的对偶，控制视角'),
          { title: 'Quaternion kinematics for the error-state Kalman filter', by: 'Joan Solà', url: 'https://arxiv.org/abs/1711.02508', kind: 'notes', note: 'ESKF 的完整推导' },
        ],
        quiz: ['卡尔曼增益趋于 0 和趋于 H⁻¹ 分别对应什么情形？', 'EKF 处理旋转时为什么要用误差状态而不是直接对四元数做加法？'],
      },
      {
        id: 'factor-graph',
        title: '非线性最小二乘、因子图与 SLAM 后端',
        en: 'Nonlinear Least Squares, Factor Graphs & SLAM',
        hours: 30,
        summary:
          '滤波只保留当前状态，平滑则同时优化一段轨迹的所有状态。把 MAP 估计写成非线性最小二乘，用因子图表示变量与测量的关系，利用稀疏性高效求解——这是现代 SLAM、视觉惯性里程计（VIO）、多传感器融合的统一框架。',
        points: [
          'MAP 估计 = 非线性最小二乘；高斯-牛顿与 Levenberg–Marquardt；鲁棒核函数处理外点',
          '因子图：变量节点 + 因子节点；稀疏信息矩阵与消元顺序；iSAM2 增量求解；滑动窗口与边缘化',
          'IMU 预积分：在因子图里高效使用高频 IMU',
          '位姿图优化与回环检测；地图表示（稀疏点、稠密体素 / TSDF、高斯泼溅）',
          '在流形上优化：SE(3) 的 ⊞ 参数化，避免过参数化与奇异',
        ],
        formulas: [
          { latex: 'x^{*} = \\arg\\min_x \\sum_i \\big\\|h_i(x) - z_i\\big\\|_{\\Sigma_i}^2,\\qquad \\|e\\|_\\Sigma^2 = e^{\\top}\\Sigma^{-1}e', caption: 'MAP 估计写成加权非线性最小二乘' },
          { latex: '(J^{\\top}\\Sigma^{-1}J)\\,\\delta x = -J^{\\top}\\Sigma^{-1} e(x)', caption: '高斯-牛顿法的正规方程（稀疏）' },
        ],
        resources: [
          { title: 'Factor Graphs for Robot Perception', by: 'Dellaert & Kaess · Foundations and Trends in Robotics', url: 'https://www.cs.cmu.edu/~kaess/pub/Dellaert17fnt.pdf', kind: 'book', note: '免费 PDF，因子图与 SLAM 的权威综述', primary: true },
          R.barfoot('第 4 章批量估计，第 9 章位姿与地图'),
          { title: 'On-Manifold Preintegration for Real-Time Visual-Inertial Odometry', by: 'Forster, Carlone, Dellaert, Scaramuzza · T-RO 2017', url: 'https://arxiv.org/abs/1512.02363', kind: 'paper', note: 'IMU 预积分的标准参考' },
          { title: 'GTSAM', by: 'Georgia Tech / Borglab', url: 'https://gtsam.org/', kind: 'tool', note: '因子图库，官方教程 "Factor Graphs and GTSAM" 是最好的入门' },
          { title: 'Past, Present, and Future of SLAM: Toward the Robust-Perception Age', by: 'Cadena 等 · T-RO 2016', url: 'https://arxiv.org/abs/1606.05830', kind: 'paper', note: 'SLAM 领域综述' },
        ],
        quiz: ['为什么平滑（批量估计）比滤波精度更高？代价是什么？', '因子图的信息矩阵为什么稀疏？稠密化（fill-in）从哪里来？'],
        papers: ['slam'],
      },
      {
        id: 'vo-perception',
        title: '视觉里程计、VIO 与机器人感知',
        en: 'Visual Odometry, VIO & Perception for Robots',
        hours: 25,
        summary:
          '相机是最便宜、信息最丰富的传感器。视觉里程计从特征匹配 / 光流与多视几何恢复运动，加上 IMU 就是 VIO（VINS-Mono、ORB-SLAM3）；操作与导航还需要物体位姿估计、分割与深度估计——如今大多由学习模型（DINOv2、SAM 2、FoundationPose）提供。这里把几何与学习两条线接起来。',
        points: [
          '多视几何：本质矩阵 / 单应、PnP、三角化、光束法平差（BA）；直接法 vs 特征法',
          'VIO 系统结构：前端（特征跟踪、关键帧）、后端（滑动窗口 BA / 因子图）、初始化与尺度可观性',
          '深度估计与三维表示：立体匹配、单目深度、TSDF、NeRF / 3D 高斯泼溅在机器人中的用途',
          '感知模型：分割（SAM 2）、开放词汇检测、6D 位姿估计（FoundationPose）、视觉基础模型特征（DINOv2）作为策略输入',
          '感知的不确定性如何进入估计与控制',
        ],
        resources: [
          { title: 'Visual Odometry: Part I & II（教程）', by: 'Scaramuzza & Fraundorfer · IEEE RAM 2011–12', url: 'https://rpg.ifi.uzh.ch/docs/VO_Part_I_Scaramuzza.pdf', kind: 'paper', note: 'VO 入门最好的两篇教程', primary: true },
          { title: 'Computer Vision: Algorithms and Applications', by: 'Richard Szeliski', url: 'https://szeliski.org/Book/', kind: 'book', note: '第 11–12 章：结构与运动、深度' },
          { title: 'VINS-Mono', by: 'Qin, Li, Shen · T-RO 2018', url: 'https://arxiv.org/abs/1708.03852', kind: 'paper', note: '开源 VIO 的标杆，代码可读' },
          { title: 'ORB-SLAM3', by: 'Campos 等 · T-RO 2021', url: 'https://arxiv.org/abs/2007.11898', kind: 'paper' },
          R.manipulation('Ch. Geometric Pose Estimation & Deep Perception', 'https://manipulation.csail.mit.edu/pose.html', '操作视角的感知：ICP、位姿估计、分割'),
          { title: 'FoundationPose: Unified 6D Pose Estimation and Tracking of Novel Objects', by: 'Wen 等 · CVPR 2024', url: 'https://arxiv.org/abs/2312.08344', kind: 'paper' },
          { title: 'DINOv2: Learning Robust Visual Features without Supervision', by: 'Oquab 等 · Meta 2023', url: 'https://arxiv.org/abs/2304.07193', kind: 'paper', note: '机器人策略常用的视觉主干' },
        ],
        quiz: ['单目 VO 为什么没有尺度？加 IMU 后尺度为什么可观（在什么运动下不可观）？', '为什么机器人策略常用冻结的 DINOv2 特征而不是端到端训练视觉主干？'],
        papers: ['visual-inertial', 'odometry', 'pose estimation', 'perception'],
      },
      {
        id: 'legged-estimation',
        title: '足式机器人状态估计与本体感受融合',
        en: 'Legged-Robot State Estimation',
        hours: 15,
        summary:
          '足式机器人的控制器需要 kHz 级的基座速度与姿态估计，而 GPS 不可用、视觉可能失效。标准做法是把 IMU 与腿部运动学（「触地的脚不动」这一假设）融合，用 EKF 或不变 EKF（InEKF）实现。这是把前面的动力学、李群与滤波知识汇聚在一起的绝佳案例。',
        points: [
          '腿部里程计：接触脚速度为零的约束；接触检测（力传感器 / 概率接触估计）',
          'IMU 传播 + 腿运动学更新的 EKF（Bloesch 2012）；漂移的不可观方向',
          '不变 EKF：在李群 SE_{2+N}(3) 上做滤波，收敛性与一致性更好',
          '与学习结合：用网络估计速度 / 接触，或把估计器与 RL 策略端到端训练',
        ],
        resources: [
          { title: 'State Estimation for Legged Robots — Consistent Fusion of Leg Kinematics and IMU', by: 'Bloesch, Hutter 等 · RSS 2012', url: 'https://www.roboticsproceedings.org/rss08/p03.pdf', kind: 'paper', note: '足式状态估计的奠基论文', primary: true },
          { title: 'Contact-Aided Invariant Extended Kalman Filtering for Robot State Estimation', by: 'Hartley, Ghaffari, Eustice, Grizzle · IJRR 2020', url: 'https://arxiv.org/abs/1904.09251', kind: 'paper', note: '不变 EKF 用于双足，开源实现 invariant-ekf' },
          { title: 'Cheetah-Software（state estimator 模块）', by: 'MIT Biomimetic Robotics Lab', url: 'https://github.com/mit-biomimetics/Cheetah-Software', kind: 'tool', note: '可读性很好的工程实现，与凸 MPC 配套' },
        ],
        quiz: ['为什么仅用 IMU + 腿运动学，基座的绝对位置与偏航角不可观？', '接触检测出错（脚在打滑）时估计器会发生什么？如何缓解？'],
        papers: ['state estimation', 'legged'],
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'simulation',
    emoji: '🧪',
    title: '仿真工具',
    en: 'Simulation Tools',
    tagline: '物理引擎原理、主流仿真器选型、GPU 并行与可微仿真、资产与场景。',
    intro:
      '仿真是机器人学习与控制的「训练场」：控制器先在仿真里验证，RL 策略几乎全在仿真里训练。要用好仿真，需要理解物理引擎在每一步做什么（积分、约束、接触），知道 MuJoCo / Isaac / Drake / Genesis 各自适合什么，会用 GPU 并行与可微仿真，并能把机器人模型与场景资产做对。',
    outcomes: ['理解一个仿真步内积分器与接触求解器的工作', '能根据任务选择合适的仿真器并说出取舍', '能在 MJX / Isaac Lab 上跑起千级并行环境', '能写 / 转换 URDF、MJCF、USD 并搭建随机化场景'],
    prereq: ['modeling'],
    topics: [
      {
        id: 'physics-engine',
        title: '物理引擎原理：积分、约束与接触求解',
        en: 'Physics Engine Internals',
        hours: 20,
        summary:
          '仿真器的一步 = 算动力学 + 检测碰撞 + 求解约束 / 接触 + 积分。不同引擎在「接触怎么算」上分歧最大：刚性 LCP、软约束（MuJoCo）、罚函数（早期 Bullet）、可微的压力场（Drake hydroelastic）。理解这些决定了你的策略能否迁移到真机，以及仿真为什么会「爆炸」。',
        points: [
          '广义坐标 vs 最大坐标；正动力学（ABA / CRBA）与约束的拼接',
          '积分器：显式 / 半隐式欧拉、RK4、隐式积分；时间步长、子步与稳定性',
          '碰撞检测：宽相（BVH）与窄相（GJK / MPR / SAT），凸分解，接触点生成',
          '接触求解：LCP / PGS / TGS 迭代、MuJoCo 的软约束与凸优化、Drake 的 hydroelastic；参数（solref / solimp、ERP / CFM）的物理含义',
          '仿真的「作弊」与假象：穿透、抖动、能量注入、过大的摩擦锥近似；如何验证仿真质量',
        ],
        resources: [
          { title: 'MuJoCo 文档：Computation & Modeling', by: 'Google DeepMind', url: 'https://mujoco.readthedocs.io/en/stable/computation/index.html', kind: 'notes', note: '写得最清楚的「一个仿真步做了什么」', primary: true },
          { title: 'MuJoCo: A Physics Engine for Model-Based Control', by: 'Todorov, Erez, Tassa · IROS 2012', url: 'https://homes.cs.washington.edu/~todorov/papers/TodorovIROS12.pdf', kind: 'paper', note: '软约束接触模型的设计动机' },
          { title: 'Contact Models in Robotics: a Comparative Analysis', by: 'Le Lidec 等 · 2023', url: 'https://arxiv.org/abs/2304.06372', kind: 'paper' },
          { title: 'Drake：Hydroelastic Contact 用户指南', by: 'TRI', url: 'https://drake.mit.edu/doxygen_cxx/group__hydroelastic__user__guide.html', kind: 'notes' },
          R.cmu745('Lecture 2: Dynamics Discretization & Stability', '积分器与稳定性'),
        ],
        quiz: ['把 MuJoCo 的时间步从 2 ms 改到 10 ms，哪些现象会先出问题？', '软接触参数调「硬」为什么会让仿真不稳定？'],
        papers: ['simulation', 'physics'],
      },
      {
        id: 'simulators',
        title: '主流仿真器与选型',
        en: 'Simulator Landscape & Selection',
        hours: 15,
        summary:
          '没有「最好的仿真器」，只有最适合任务的：MuJoCo 接触与速度俱佳、生态最好；Isaac Sim / Lab 有 GPU 并行与光线追踪渲染；Drake 强在建模严谨与优化工具；Genesis / SAPIEN / ManiSkill 面向操作与生成式场景；Gazebo 与 ROS 集成紧密；RaiSim 曾是足式 RL 的主力。学会按接触精度、速度、渲染、生态四个维度取舍。',
        points: [
          'MuJoCo（+ MJX、Menagerie、Playground）：接触、速度、Python 生态、官方机器人模型库',
          'Isaac Sim / Isaac Lab：PhysX GPU 并行、RTX 渲染、USD 资产；需要 NVIDIA GPU',
          'Drake：多体动力学 + 优化 + 系统框架，适合模型验证与 MPC / 轨迹优化研究',
          'Genesis、SAPIEN / ManiSkill、robosuite、PyBullet：操作、生成式场景、benchmark',
          'Gazebo（ROS 集成）、Webots；选型清单：接触精度、吞吐、渲染 / 传感器、资产、许可',
        ],
        resources: [
          { title: 'MuJoCo', by: 'Google DeepMind', url: 'https://mujoco.readthedocs.io/', kind: 'tool', note: '开源、Apache 2.0、Python 绑定完善', primary: true },
          { title: 'MuJoCo Menagerie', by: 'Google DeepMind', url: 'https://github.com/google-deepmind/mujoco_menagerie', kind: 'tool', note: '高质量官方机器人模型库（机械臂、四足、人形、手）' },
          { title: 'Isaac Lab', by: 'NVIDIA', url: 'https://isaac-sim.github.io/IsaacLab/', kind: 'tool', note: 'GPU 并行机器人学习框架（Isaac Sim 之上）' },
          { title: 'Drake', by: 'Toyota Research Institute / MIT', url: 'https://drake.mit.edu/', kind: 'tool', note: 'Tedrake 教材配套，建模 + 优化 + 仿真一体' },
          { title: 'Genesis', by: 'Genesis Embodied AI', url: 'https://github.com/Genesis-Embodied-AI/Genesis', kind: 'tool', note: '统一多物理（刚体、软体、流体）+ 生成式场景' },
          { title: 'ManiSkill', by: 'Hao Su Lab · UCSD', url: 'https://github.com/haosulab/ManiSkill', kind: 'tool', note: '基于 SAPIEN 的 GPU 并行操作 benchmark' },
          { title: 'robosuite', by: 'ARISE Initiative', url: 'https://github.com/ARISE-Initiative/robosuite', kind: 'tool', note: 'MuJoCo 之上的操作任务套件' },
          { title: 'Gazebo', by: 'Open Robotics', url: 'https://gazebosim.org/', kind: 'tool', note: 'ROS 2 集成最好的仿真器' },
          { title: 'Bullet / PyBullet', by: 'Erwin Coumans', url: 'https://github.com/bulletphysics/bullet3', kind: 'tool' },
        ],
        quiz: ['训练一个灵巧手抓取策略与验证一个 MPC 控制器，分别更适合哪类仿真器？为什么？', 'Isaac Lab 与 MJX 都能并行上万环境，主要区别是什么？'],
        papers: ['simulator', 'benchmark'],
      },
      {
        id: 'gpu-diff-sim',
        title: 'GPU 并行仿真与可微仿真',
        en: 'GPU-Parallel & Differentiable Simulation',
        hours: 15,
        summary:
          '把几千个环境放到 GPU 上一起仿真，让 RL 训练从几天缩到几分钟；把仿真写成可微函数，则能直接用梯度做策略优化或系统辨识。可微仿真在光滑动力学上很强，但接触带来的不连续让梯度失真——什么时候该用零阶（RL）什么时候该用一阶，是一个活跃的研究问题。',
        points: [
          'GPU 并行的结构：批量化动力学、按环境重置、观测 / 奖励在 GPU 上计算；吞吐 vs 单步精度',
          'MJX（JAX）、Isaac Lab（PhysX）、Brax、Warp：各自的编程模型',
          '可微仿真：自动微分穿过积分器与接触求解器；软化接触以获得有用梯度',
          '一阶策略优化（SHAC、Brax APG）vs 零阶（PPO）；梯度的方差与偏差（Suh 等 2022）',
          '可微仿真用于系统辨识与 real-to-sim',
        ],
        resources: [
          { title: 'MJX：MuJoCo on JAX', by: 'Google DeepMind', url: 'https://mujoco.readthedocs.io/en/stable/mjx.html', kind: 'notes', primary: true },
          { title: 'MuJoCo Playground', by: 'Google DeepMind', url: 'https://github.com/google-deepmind/mujoco_playground', kind: 'tool', note: 'MJX 之上的开源 sim-to-real 环境集合' },
          { title: 'Brax', by: 'Google', url: 'https://github.com/google/brax', kind: 'tool', note: 'JAX 可微物理引擎与 RL 算法' },
          { title: 'NVIDIA Warp', by: 'NVIDIA', url: 'https://github.com/NVIDIA/warp', kind: 'tool', note: 'Python 写 GPU 可微物理内核' },
          { title: 'Do Differentiable Simulators Give Better Policy Gradients?', by: 'Suh, Simchowitz, Zhang, Tedrake · ICML 2022', url: 'https://arxiv.org/abs/2202.00817', kind: 'paper', note: '一阶 vs 零阶梯度的理论分析' },
          { title: 'Accelerated Policy Learning with Parallel Differentiable Simulation (SHAC)', by: 'Xu 等 · ICLR 2022', url: 'https://arxiv.org/abs/2204.07137', kind: 'paper' },
          { title: 'Dojo: A Differentiable Physics Engine for Robotics', by: 'Howell 等 · 2022', url: 'https://arxiv.org/abs/2203.00806', kind: 'paper', note: '为可微与精确接触设计的引擎' },
        ],
        quiz: ['为什么接触会让仿真梯度「不可靠」？软化接触解决了什么、又带来了什么？', 'GPU 并行仿真里「每个环境独立重置」为什么是性能关键？'],
        papers: ['differentiable simulation', 'gpu'],
      },
      {
        id: 'assets-scenes',
        title: '机器人模型、资产与场景构建',
        en: 'Robot Descriptions, Assets & Scene Generation',
        hours: 10,
        summary:
          '模型不对，仿真再准也没用。URDF / MJCF / USD 是三种主流描述格式，各有语义差异；惯量、关节限位、执行器与传感器参数决定了仿真与真机的一致性；训练数据的多样性来自程序化场景生成、随机化材质与光照、以及从真实扫描得到的资产。',
        points: [
          'URDF（ROS）、MJCF（MuJoCo）、USD（Isaac）：树结构、惯量、碰撞体 vs 视觉体；格式转换的坑',
          '惯性参数怎么来（CAD、辨识）；执行器模型（位置伺服 PD、力矩、齿轮比、限幅）与传感器（IMU、相机、接触）',
          '碰撞几何简化：凸分解、基元近似、接触对过滤',
          '程序化场景生成、域随机化（材质、光照、相机位姿）、渲染管线与合成数据',
          '真实到仿真的资产：扫描、NeRF / 3DGS 重建、物体数据集（YCB、Objaverse）',
        ],
        resources: [
          { title: 'MuJoCo 文档：Modeling & XML Reference', by: 'Google DeepMind', url: 'https://mujoco.readthedocs.io/en/stable/modeling.html', kind: 'notes', note: 'MJCF 的每个属性', primary: true },
          { title: 'MuJoCo Menagerie', by: 'Google DeepMind', url: 'https://github.com/google-deepmind/mujoco_menagerie', kind: 'tool', note: '学习如何写高质量模型的最佳范例' },
          { title: 'Isaac Sim 文档', by: 'NVIDIA', url: 'https://docs.isaacsim.omniverse.nvidia.com/', kind: 'notes', note: 'USD 资产、URDF 导入、传感器与渲染' },
          { title: 'Reconciling Reality through Simulation: A Real-to-Sim-to-Real Approach (RialTo)', by: 'Torne 等 · RSS 2024', url: 'https://arxiv.org/abs/2403.03949', kind: 'paper', note: '从真实场景扫描构建仿真数字孪生' },
        ],
        quiz: ['为什么碰撞体要比视觉体简单？过于精细的碰撞网格会带来什么问题？', 'URDF 的 joint 与 MJCF 的 joint 在语义上有什么不同？'],
        papers: ['digital twin', 'scene generation'],
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'sim2real',
    emoji: '🌉',
    title: 'Sim-to-Real 迁移',
    en: 'Sim-to-Real Transfer',
    tagline: '现实差距从哪来、系统辨识、域随机化与自适应、感知迁移、评估与迭代。',
    intro:
      '仿真里训练好的策略拿到真机上不一定能用——这就是现实差距（reality gap）。这一模块系统地讲：差距来自哪里（动力学、执行器、延迟、感知），如何缩小（系统辨识、real-to-sim），如何让策略对差距不敏感（域随机化、特权学习、在线自适应），以及感知侧的迁移与一套可复现的评估-迭代流程。',
    outcomes: ['能定位一个策略在真机上失败的主要差距来源', '能为机器人做惯性 / 执行器 / 延迟的辨识', '能设计合理的随机化范围与自适应机制', '能建立 sim-to-real 的评估流程'],
    prereq: ['rl', 'simulation'],
    topics: [
      {
        id: 'reality-gap-sysid',
        title: '现实差距的来源与系统辨识',
        en: 'Reality Gap & System Identification',
        hours: 20,
        summary:
          '缩小差距的第一步是把差距量化：惯性参数、关节摩擦、执行器带宽与力矩限制、通信延迟、传感噪声，每一项都能用真机数据辨识。刚体动力学对惯性参数是线性的，可以用最小二乘辨识；执行器则常用小网络（actuator net）拟合。',
        points: [
          '差距分类：动力学参数、未建模动力学（执行器、柔性、摩擦、缆线）、延迟与采样、感知差异、初始状态分布',
          '惯性参数辨识：Y(q,q̇,q̈)π = τ 的线性最小二乘，激励轨迹设计，物理一致性约束（LMI）',
          '执行器辨识：PD 伺服的实际带宽、力矩-电流关系、齿轮摩擦；actuator net（历史输入 → 实际力矩）',
          '延迟测量与建模：传感到执行的端到端延迟，在仿真里注入延迟',
          'real-to-sim：用真机轨迹校准仿真参数（可微仿真 / 贝叶斯优化 / CEM）',
        ],
        formulas: [
          { latex: 'Y(q,\\dot q,\\ddot q)\\,\\pi = \\tau,\\qquad \\hat\\pi = \\arg\\min_{\\pi\\in\\mathcal{P}} \\|Y\\pi - \\tau\\|^2', caption: '动力学对惯性参数线性：最小二乘辨识（P 为物理一致集合）' },
        ],
        resources: [
          { title: 'Learning Agile and Dynamic Motor Skills for Legged Robots', by: 'Hwangbo 等 · Science Robotics 2019', url: 'https://arxiv.org/abs/1901.08652', kind: 'paper', note: 'actuator net 的提出；ANYmal sim-to-real 的里程碑', primary: true },
          { title: 'Sim-to-Real: Learning Agile Locomotion for Quadruped Robots', by: 'Tan 等 · RSS 2018', url: 'https://arxiv.org/abs/1804.10332', kind: 'paper', note: '执行器建模 + 延迟建模 + 随机化的系统研究' },
          { title: 'Linear Matrix Inequalities for Physically Consistent Inertial Parameter Identification', by: 'Wensing, Kim, Slotine · RA-L 2018', url: 'https://arxiv.org/abs/1701.04395', kind: 'paper' },
          R.underactuated('Ch. System Identification', 'https://underactuated.mit.edu/sysid.html', '从控制视角讲辨识'),
        ],
        quiz: ['为什么惯性参数辨识需要「激励轨迹」？什么样的轨迹信息量最大？', 'actuator net 的输入为什么要包含位置误差的历史而不只是当前值？'],
        papers: ['system identification', 'sim-to-real'],
      },
      {
        id: 'domain-randomization',
        title: '域随机化、特权学习与在线自适应',
        en: 'Domain Randomization, Privileged Learning & Adaptation',
        hours: 20,
        summary:
          '既然无法把仿真调得完全一致，就训练一个对差距不敏感的策略：随机化动力学与观测（DR），让策略在分布上覆盖真机；再进一步，让策略从历史观测中推断环境参数（RMA、特权教师-学生），实现在线自适应。自动域随机化（ADR）让随机化范围随能力自动增长。',
        points: [
          '域随机化：随机什么（质量、摩擦、电机增益、延迟、噪声、外力推）、范围怎么定；范围过大导致保守策略',
          '自动域随机化（ADR）与课程；对抗性扰动',
          '特权学习：教师看真值参数，学生从本体感受历史估计（RMA 的自适应模块、隐式系统辨识）',
          '在线自适应：快速适应模块、上下文编码器、元学习；真机微调（见离线 RL 与策略微调）',
          '鲁棒性与性能的权衡；如何判断该加随机化还是该修模型',
        ],
        resources: [
          { title: 'Domain Randomization for Transferring Deep Neural Networks from Simulation to the Real World', by: 'Tobin 等 · IROS 2017', url: 'https://arxiv.org/abs/1703.06907', kind: 'paper', note: 'DR 的起点（感知侧）' },
          { title: 'Solving Rubik\'s Cube with a Robot Hand（ADR）', by: 'OpenAI · 2019', url: 'https://arxiv.org/abs/1910.07113', kind: 'paper', note: '自动域随机化' },
          { title: 'RMA: Rapid Motor Adaptation for Legged Robots', by: 'Kumar, Fu, Pathak, Malik · RSS 2021', url: 'https://arxiv.org/abs/2107.04034', kind: 'paper', note: '特权教师 + 自适应模块的经典配方', primary: true },
          { title: 'Learning Quadrupedal Locomotion over Challenging Terrain', by: 'Lee 等 · Science Robotics 2020', url: 'https://arxiv.org/abs/2010.11251', kind: 'paper', note: '教师-学生蒸馏' },
          { title: 'Sim-to-Real Transfer in Deep RL for Robotics: a Survey', by: 'Zhao, Queralta, Westerlund · 2020', url: 'https://arxiv.org/abs/2009.13303', kind: 'paper', note: '方法综述' },
        ],
        quiz: ['域随机化为什么能提升迁移？随机化范围过大会有什么后果？', 'RMA 的自适应模块在推断什么？它为什么可以只用本体感受历史？'],
        papers: ['domain randomization', 'adaptation', 'sim-to-real'],
      },
      {
        id: 'perception-sim2real',
        title: '感知的 Sim-to-Real',
        en: 'Sim-to-Real for Perception',
        hours: 15,
        summary:
          '视觉策略的差距主要在图像分布：渲染 vs 真实相机的纹理、光照、噪声、曝光。解决路线有三：随机化外观让网络学不变特征；用深度 / 分割等对外观不敏感的中间表示；用大规模预训练的视觉主干（DINOv2、R3M）作为冻结编码器。高保真渲染与真实扫描构建的数字孪生则从源头缩小差距。',
        points: [
          '视觉域随机化（纹理、光照、相机内外参、后处理噪声）；深度图为何比 RGB 更容易迁移',
          '中间表示：分割掩码、关键点、物体位姿、点云——把感知与控制解耦',
          '预训练视觉表示：R3M、VC-1、DINOv2 作为冻结编码器；数据增强（随机裁剪）对 RL 的重要性',
          '高保真渲染（光线追踪）与数字孪生；real-to-sim 场景重建',
          '相机延迟、帧率与运动模糊的仿真建模',
        ],
        resources: [
          { title: 'Domain Randomization for Transferring Deep Neural Networks（Tobin 2017）', by: 'OpenAI', url: 'https://arxiv.org/abs/1703.06907', kind: 'paper', primary: true },
          { title: 'R3M: A Universal Visual Representation for Robot Manipulation', by: 'Nair 等 · CoRL 2022', url: 'https://arxiv.org/abs/2203.12601', kind: 'paper' },
          { title: 'DINOv2', by: 'Oquab 等 · Meta 2023', url: 'https://arxiv.org/abs/2304.07193', kind: 'paper' },
          { title: 'Reconciling Reality through Simulation (RialTo)', by: 'Torne 等 · RSS 2024', url: 'https://arxiv.org/abs/2403.03949', kind: 'paper', note: 'real-to-sim-to-real 的完整流程' },
          { title: 'Isaac Sim 文档：Replicator / 合成数据', by: 'NVIDIA', url: 'https://docs.isaacsim.omniverse.nvidia.com/', kind: 'notes' },
        ],
        quiz: ['为什么深度图策略通常比 RGB 策略更容易 sim-to-real？代价是什么？', '冻结预训练视觉编码器 vs 端到端微调，各在什么条件下更好？'],
        papers: ['visual', 'sim-to-real'],
      },
      {
        id: 'sim2real-eval',
        title: '评估、调试与迭代流程',
        en: 'Evaluation, Debugging & the Sim-to-Real Loop',
        hours: 10,
        summary:
          'sim-to-real 不是一次性的：仿真验证 → 仿真间迁移（sim-to-sim）→ 真机保守测试 → 记录数据回灌仿真 → 修模型或加随机化 → 再训。建立这样一个可复现的闭环，比任何单一技巧都重要。',
        points: [
          'sim-to-sim 作为第一道检验：在不同引擎 / 不同参数的仿真上评估策略',
          '真机评估协议：分级测试（悬挂 → 低增益 → 全功率）、成功率与置信区间、多次重复、失败模式记录',
          '差距诊断：对比仿真与真机的同一开环动作响应；逐项关闭随机化找关键因素',
          '数据回灌：用真机轨迹更新仿真参数或微调策略；离线评估器',
          '安全网：动作限幅、关节限位、安全滤波器、随时可切换的备份控制器',
        ],
        resources: [
          { title: 'MuJoCo Playground（含 sim-to-real 配方与踩坑记录）', by: 'Google DeepMind', url: 'https://github.com/google-deepmind/mujoco_playground', kind: 'tool', primary: true },
          { title: 'unitree_rl_gym（sim2sim + sim2real 部署示例）', by: 'Unitree', url: 'https://github.com/unitreerobotics/unitree_rl_gym', kind: 'tool', note: 'Isaac Gym 训练 → MuJoCo sim2sim → Go2 / G1 真机' },
          { title: 'Sim-to-Real Transfer in Deep RL for Robotics: a Survey', by: 'Zhao 等 · 2020', url: 'https://arxiv.org/abs/2009.13303', kind: 'paper' },
          { title: 'Learning to Walk in Minutes（附录：真机部署细节）', by: 'Rudin 等 · CoRL 2021', url: 'https://arxiv.org/abs/2109.11978', kind: 'paper' },
        ],
        quiz: ['sim-to-sim 迁移成功但 sim-to-real 失败，最可能的原因有哪些？', '为什么真机评估需要报告置信区间而不是单次成功率？'],
        papers: ['sim-to-real', 'evaluation'],
      },
    ],
  },

  /* ================================================================== */
  {
    id: 'deployment',
    emoji: '🔧',
    title: '真机部署',
    en: 'Real-Robot Deployment',
    tagline: '硬件与执行器、ROS 2 与实时软件栈、控制架构、策略推理部署、安全与运维。',
    intro:
      '算法只是一半，让它在真机上以正确的频率、正确的顺序、安全地跑起来是另一半。这一模块讲硬件（执行器、传感器、计算平台与低成本平台）、软件栈（ROS 2、实时 Linux、总线通信）、分层控制架构与时序、神经网络策略的推理部署，以及标定、安全、日志与实验方法。',
    outcomes: ['能读懂一台机器人的执行器与通信架构', '能搭建 ROS 2 + 实时控制循环并测量时序', '能把训练好的策略以稳定延迟部署到真机', '能建立安全、可复现的真机实验流程'],
    prereq: ['control', 'estimation'],
    topics: [
      {
        id: 'hardware',
        title: '硬件：执行器、传感器、计算与平台',
        en: 'Actuators, Sensors, Compute & Platforms',
        hours: 15,
        summary:
          '执行器决定了控制器能做什么：准直驱（QDD）电机力矩透明、带宽高，是足式与灵巧手的主流；谐波减速器精度高但摩擦大；串联弹性执行器（SEA）安全但带宽低。搭配 IMU、编码器、力 / 力矩传感器、相机与合适的计算平台，再从低成本开源平台起步动手。',
        points: [
          '电机与传动：BLDC + FOC、减速比与反射惯量、力矩透明性；QDD / 谐波 / 行星 / SEA 的取舍',
          '执行器控制模式：位置 / 速度 / 力矩 / 阻抗（PD + 前馈力矩）；电流环 → 力矩的映射与限制',
          '传感器：绝对 / 增量编码器、IMU、关节力矩、六维力、触觉、相机（RGB-D、事件相机）',
          '计算：实时 MCU / 电机驱动板、嵌入式 Linux（Jetson）、工作站 GPU 推理；功耗与散热',
          '低成本入门平台：SO-100 / Koch 机械臂（LeRobot）、ALOHA、Unitree Go2 / G1、Crazyflie 四旋翼、开源执行器',
        ],
        resources: [
          { title: 'A Low Cost Modular Actuator for Dynamic Robots（MIT Mini Cheetah 执行器）', by: 'Ben Katz · MIT 硕士论文', url: 'https://dspace.mit.edu/handle/1721.1/118671', kind: 'paper', note: 'QDD 执行器设计的最佳入门，开源设计', primary: true },
          { title: 'SO-ARM100 / SO-101 开源机械臂', by: 'The Robot Studio + Hugging Face', url: 'https://github.com/TheRobotStudio/SO-ARM100', kind: 'tool', note: '几百美元的模仿学习入门平台' },
          { title: 'ALOHA / Mobile ALOHA', by: 'Stanford', url: 'https://tonyzhaozh.github.io/aloha/', kind: 'tool', note: '开源双臂遥操作与模仿学习平台' },
          { title: 'Crazyflie', by: 'Bitcraze', url: 'https://www.bitcraze.io/', kind: 'tool', note: '开源微型四旋翼，控制 / 估计实验利器' },
          { title: 'unitree_rl_gym', by: 'Unitree', url: 'https://github.com/unitreerobotics/unitree_rl_gym', kind: 'tool', note: 'Go2 / G1 的 SDK 与部署示例' },
        ],
        quiz: ['为什么高减速比会让执行器「感觉不到」外力？反射惯量与减速比的关系？', '力矩控制与位置控制的执行器，各自适合什么控制算法？'],
        papers: ['hardware', 'actuator', 'low-cost'],
      },
      {
        id: 'software-stack',
        title: '软件栈：ROS 2、实时 Linux 与通信',
        en: 'ROS 2, Real-Time Linux & Communication',
        hours: 20,
        summary:
          'ROS 2 提供节点、话题、服务、参数与工具链（rviz、rosbag），ros2_control 提供硬件抽象与控制器管理；kHz 级控制循环需要实时内核（PREEMPT_RT）、线程优先级与内存锁定；与电机驱动的通信走 EtherCAT / CAN-FD，进程间用 DDS / ZeroMQ / LCM / 共享内存。理解每一层的延迟与抖动来源。',
        points: [
          'ROS 2 基本概念与工具；QoS、执行器（executor）与回调；ros2_control 的硬件接口与控制器链',
          '实时性：PREEMPT_RT、SCHED_FIFO、CPU 隔离、内存锁定；测量循环抖动（cyclictest）',
          '总线：EtherCAT（分布式时钟）、CAN / CAN-FD、串口；驱动板固件与主控的分工',
          '中间件选择：DDS vs ZeroMQ / LCM / 共享内存；何时绕开 ROS 走直连',
          '工程实践：容器化、配置管理、启动与监控、多机时间同步（PTP）',
        ],
        resources: [
          { title: 'ROS 2 官方文档与教程', by: 'Open Robotics', url: 'https://docs.ros.org/en/rolling/', kind: 'notes', primary: true },
          { title: 'ros2_control 文档', by: 'ros-controls', url: 'https://control.ros.org/', kind: 'notes', note: '硬件接口、控制器管理器、实时循环' },
          { title: 'Programming for Robotics — ROS 课程', by: 'ETH RSL', url: 'https://rsl.ethz.ch/education-students/lectures/ros.html', kind: 'course', note: '幻灯片与练习公开' },
          { title: 'ROS 2 实时编程 Demo', by: 'Open Robotics', url: 'https://docs.ros.org/en/rolling/Tutorials/Demos/Real-Time-Programming.html', kind: 'notes', note: '实时循环的内存锁定与线程设置' },
          { title: 'Robot Operating System 2: Design, Architecture, and Uses in the Wild', by: 'Macenski 等 · Science Robotics 2022', url: 'https://arxiv.org/abs/2211.07752', kind: 'paper' },
        ],
        quiz: ['为什么 1 kHz 控制循环里不该做内存分配和日志 IO？', 'EtherCAT 的分布式时钟解决了什么问题？'],
        papers: ['ros', 'real-time'],
      },
      {
        id: 'control-architecture',
        title: '分层控制架构与时序',
        en: 'Control Architecture, Rates & Latency',
        hours: 15,
        summary:
          '真机控制是一座分层塔：高层规划（1–10 Hz）→ MPC / 策略（50–500 Hz）→ 全身 / 关节控制（1 kHz）→ 电机电流环（10–40 kHz）。每一层的频率、接口和失效行为都要设计；状态机 / 行为树组织模式切换；延迟补偿与时间戳对齐决定了整个系统能否稳定。',
        points: [
          '频率分层与接口约定：上层给什么（轨迹 / 目标 / 力矩前馈 + PD 增益），下层如何插值与保持',
          '延迟预算：感知 → 估计 → 决策 → 执行的端到端延迟，时间戳、外推与补偿',
          'RL 策略部署的典型接口：策略输出目标关节角，关节 PD 在 kHz 级执行；增益与仿真一致',
          '模式管理：状态机 / 行为树（站起、行走、跌倒恢复、急停），平滑切换与混合',
          '失效行为设计：通信超时、传感器丢失、求解器不收敛时怎么办',
        ],
        resources: [
          { title: 'Cheetah-Software', by: 'MIT Biomimetic Robotics Lab', url: 'https://github.com/mit-biomimetics/Cheetah-Software', kind: 'tool', note: '完整的分层架构范例：状态机 → MPC → WBC → 关节', primary: true },
          { title: 'Behavior Trees in Robotics and AI', by: 'Colledanchise & Ögren', url: 'https://arxiv.org/abs/1709.00084', kind: 'book' },
          { title: 'legged_gym / rsl_rl 的部署接口', by: 'ETH RSL', url: 'https://github.com/leggedrobotics/legged_gym', kind: 'tool', note: '策略输出 → 关节 PD 的标准接口' },
          { title: 'Learning Agile and Dynamic Motor Skills（方法部分：部署架构）', by: 'Hwangbo 等 · 2019', url: 'https://arxiv.org/abs/1901.08652', kind: 'paper' },
        ],
        quiz: ['为什么 RL 策略通常以 50 Hz 输出目标关节角而不是直接输出 1 kHz 力矩？', '如果状态估计延迟 20 ms，MPC 应该如何补偿？'],
        papers: ['deployment', 'architecture'],
      },
      {
        id: 'policy-deployment',
        title: '神经网络策略的推理部署',
        en: 'Deploying Learned Policies',
        hours: 15,
        summary:
          '把 PyTorch 里训练的策略搬到机器人上：导出为 ONNX / TorchScript，用 ONNX Runtime / TensorRT 在 CPU 或 Jetson 上以稳定延迟推理；观测管线（归一化、历史堆叠、传感器对齐）必须与训练时逐位一致；VLA 等大模型需要异步推理、动作分块与远程推理服务。',
        points: [
          '模型导出与推理引擎：ONNX / TorchScript / TensorRT；量化与延迟测量；确定性与 warm-up',
          '观测一致性：归一化统计、历史缓冲、单位与坐标系、传感器时间对齐——最常见的部署 bug',
          '动作后处理：限幅、平滑 / 低通、动作分块与时间集成、与 PD 增益的匹配',
          '大模型策略（VLA、扩散策略）：推理延迟与动作分块、异步执行、云端 / 边缘推理服务',
          '监控与回滚：推理超时检测、置信度 / OOD 检测、切换到保守控制器',
        ],
        resources: [
          { title: 'ONNX Runtime', by: 'Microsoft', url: 'https://onnxruntime.ai/', kind: 'tool', note: 'CPU / GPU / Jetson 上的通用推理引擎', primary: true },
          { title: 'LeRobot（真机数据采集、训练与部署一体）', by: 'Hugging Face', url: 'https://github.com/huggingface/lerobot', kind: 'tool', note: 'ACT / Diffusion / VLA 在低成本机械臂上的完整流程' },
          { title: 'unitree_rl_gym（sim2real 部署脚本）', by: 'Unitree', url: 'https://github.com/unitreerobotics/unitree_rl_gym', kind: 'tool' },
          { title: 'π0（论文中的推理与动作分块设计）', by: 'Black 等 · Physical Intelligence 2024', url: 'https://arxiv.org/abs/2410.24164', kind: 'paper' },
          { title: 'Learning Fine-Grained Bimanual Manipulation（ACT 的时间集成）', by: 'Zhao 等 · RSS 2023', url: 'https://arxiv.org/abs/2304.13705', kind: 'paper' },
        ],
        quiz: ['训练时观测归一化用的均值 / 方差在部署时弄错会发生什么？如何自检？', '动作分块为什么能缓解大模型推理延迟？它的代价是什么？'],
        papers: ['deployment', 'inference', 'vla'],
      },
      {
        id: 'safety-ops',
        title: '标定、安全与实验运维',
        en: 'Calibration, Safety & Experimental Practice',
        hours: 15,
        summary:
          '真机实验的成败往往取决于「非算法」环节：机器人有没有标定好、有没有硬件急停与软件安全滤波、数据有没有完整记录、实验能不能复现。把这些做成流程，才能把研究时间花在算法上。',
        points: [
          '标定流程：关节零位与运动学标定、相机内外参与手眼标定、IMU 与力传感器零偏、定期复检',
          '安全分层：硬件急停与限流、固件限位、软件关节 / 速度 / 力矩限幅、安全滤波器（CBF）、看门狗与超时',
          '分级测试：吊挂 / 支架 → 低增益 → 受限空间 → 全功能；每次改动只改一个变量',
          '日志与可视化：rosbag / MCAP、Foxglove、rerun；记录一切（观测、动作、时间戳、版本号）',
          '实验方法：预注册指标、多次重复、失败模式分类、硬件维护与备件',
        ],
        resources: [
          { title: 'Kalibr', by: 'ETH ASL', url: 'https://github.com/ethz-asl/kalibr', kind: 'tool', note: '相机 / IMU 标定' },
          { title: 'Control Barrier Functions: Theory and Applications', by: 'Ames 等 · 2019', url: 'https://arxiv.org/abs/1903.11199', kind: 'paper', note: '安全滤波器的理论基础' },
          { title: 'Foxglove', by: 'Foxglove', url: 'https://foxglove.dev/', kind: 'tool', note: '机器人数据可视化与回放（免费版够用）', primary: true },
          { title: 'Rerun', by: 'Rerun', url: 'https://rerun.io/', kind: 'tool', note: '开源多模态日志可视化 SDK' },
          { title: 'MoveIt 2（含手眼标定插件）', by: 'PickNik', url: 'https://moveit.picknik.ai/', kind: 'tool' },
        ],
        quiz: ['一个安全滤波器应该放在控制塔的哪一层？为什么？', '为什么日志里必须记录代码 / 模型版本与配置哈希？'],
        papers: ['safety', 'calibration'],
      },
    ],
  },
];

/** 全部主题的扁平列表，方便统计与进度计算 */
export const allTopics = modules.flatMap((m) => m.topics.map((t) => ({ ...t, module: m.id })));
export const totalHours = allTopics.reduce((s, t) => s + t.hours, 0);
export const moduleHours = (m: Module) => m.topics.reduce((s, t) => s + t.hours, 0);
export const findModule = (id: string) => modules.find((m) => m.id === id);

export const kindMeta: Record<ResourceKind, { icon: string; label: string }> = {
  book: { icon: '📘', label: '教材' },
  course: { icon: '🎓', label: '课程' },
  video: { icon: '🎬', label: '视频' },
  notes: { icon: '📝', label: '讲义 / 文档' },
  paper: { icon: '📄', label: '论文' },
  tool: { icon: '🧰', label: '工具 / 代码' },
};
