/**
 * 「理论基础」页面的课程内容：一条从零开始的机器人学理论学习路线。
 *
 * 所有推荐资料都是可以免费公开获取的（教材 PDF、课程主页、讲座视频、论文预印本），符合本项目零成本原则。
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
  id: string;
  emoji: string;
  title: string;
  en: string;
  intro: string;
  prereq?: string[]; // 依赖的模块 id
  topics: Topic[];
}

export const modules: Module[] = [
  /* ------------------------------------------------------------------ */
  {
    id: 'math',
    emoji: '📐',
    title: '数学与物理准备',
    en: 'Mathematical Preliminaries',
    intro:
      '机器人学是把线性代数、微积分、概率和优化用在物理系统上。这一阶段不求深，只求把后面反复出现的工具（矩阵分解、雅可比、高斯分布、拉格朗日乘子）用熟。建议边学后面的内容边回头补。',
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
          { title: '16-745 Lecture 2: Dynamics Discretization & Stability', by: 'Zac Manchester · CMU', url: 'https://optimalcontrol.ri.cmu.edu/lectures/', kind: 'video', note: '从机器人角度讲积分器选择和稳定性，一节课讲透' },
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
          { title: '16-745 Lectures 3–6: Optimization', by: 'Zac Manchester · CMU', url: 'https://optimalcontrol.ri.cmu.edu/lectures/', kind: 'video', note: '专门面向控制的优化速成：牛顿法、KKT、正则化、增广拉格朗日' },
          { title: 'Algorithms for Optimization', by: 'Kochenderfer & Wheeler · MIT Press', url: 'https://algorithmsbook.com/optimization/', kind: 'book', note: '免费 PDF，每个算法配 Julia 代码和图示' },
        ],
        quiz: ['为什么牛顿法在最优点附近收敛快，但海森矩阵不正定时需要正则化？', 'QP 与一般 NLP 在求解上的本质区别是什么？MPC 为什么偏爱 QP？'],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'modeling',
    emoji: '🦾',
    title: '运动学与动力学建模',
    en: 'Kinematics & Dynamics',
    intro:
      '这是机器人学的「本体论」：如何用数学描述一个由刚体和关节组成的机构在哪里、怎么动、受什么力。学完你应该能对一个机械臂或四足机器人写出它的正运动学、雅可比和运动方程，并在 MuJoCo / Pinocchio 里验证。',
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
          '角速度与旋量（twist）ξ = (ω, v)，se(3) 与指数映射 exp: se(3) → SE(3)',
          '在李群上做优化 / 滤波：用切空间的小扰动 δ ∈ ℝ⁶ 表示误差（⊞ / ⊟ 运算）',
        ],
        formulas: [
          { latex: 'T = \\begin{bmatrix} R & p \\\\ 0 & 1 \\end{bmatrix} \\in SE(3),\\quad R^{\\top}R = I,\\; \\det R = 1', caption: '齐次变换矩阵' },
          { latex: 'R = \\exp([\\hat{\\omega}]\\theta) = I + \\sin\\theta\\,[\\hat{\\omega}] + (1-\\cos\\theta)[\\hat{\\omega}]^2', caption: 'Rodrigues 公式：轴角 → 旋转矩阵' },
        ],
        resources: [
          { title: 'Modern Robotics（第 3 章 Rigid-Body Motions）', by: 'Lynch & Park · Northwestern', url: 'https://hades.mech.northwestern.edu/index.php/Modern_Robotics', kind: 'book', note: '免费 PDF + 配套视频 + Coursera，本模块的主教材', primary: true },
          { title: 'A micro Lie theory for state estimation in robotics', by: 'Solà, Deray, Atchuthan', url: 'https://arxiv.org/abs/1812.01537', kind: 'paper', note: '把李群工具讲成「工程手册」，估计与优化都要用' },
          { title: '16-745 Lectures 14–16: Rotations', by: 'Zac Manchester · CMU', url: 'https://optimalcontrol.ri.cmu.edu/lectures/', kind: 'video', note: '如何在带旋转的状态上做 LQR / 优化' },
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
          '指数积公式 T(θ) = e^{[S₁]θ₁} ⋯ e^{[Sₙ]θₙ} M，比 D-H 参数更少出错',
          '空间 / 本体雅可比，奇异构型与可操作度椭球',
          '数值逆运动学：牛顿-拉夫森、阻尼最小二乘（DLS）、零空间投影实现多任务优先级',
          '把 IK 写成 QP：加关节限位、避障、速度约束——这就是「任务空间控制」的雏形',
        ],
        formulas: [
          { latex: 'T(\\theta) = e^{[\\mathcal{S}_1]\\theta_1}\\, e^{[\\mathcal{S}_2]\\theta_2}\\cdots e^{[\\mathcal{S}_n]\\theta_n}\\, M', caption: '指数积（PoE）正运动学' },
          { latex: '\\mathcal{V} = J(\\theta)\\,\\dot{\\theta},\\qquad \\dot{\\theta} = J^{\\top}(JJ^{\\top} + \\lambda^2 I)^{-1}\\,\\mathcal{V}_d', caption: '雅可比与阻尼最小二乘逆运动学' },
        ],
        resources: [
          { title: 'Modern Robotics（第 4–6 章）', by: 'Lynch & Park', url: 'https://hades.mech.northwestern.edu/index.php/Modern_Robotics', kind: 'book', note: '正运动学、速度运动学、逆运动学', primary: true },
          { title: 'Robotic Manipulation（Ch. 3 Basic Pick and Place）', by: 'Russ Tedrake · MIT', url: 'https://manipulation.csail.mit.edu/pick.html', kind: 'book', note: '在线教材 + Drake 交互 notebook，把 IK 写成优化问题的现代视角' },
          { title: 'CS223A Introduction to Robotics', by: 'Oussama Khatib · Stanford', url: 'https://see.stanford.edu/Course/CS223A', kind: 'course', note: '经典入门课完整视频（Stanford Engineering Everywhere）' },
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
          '机器人动力学标准形式：质量矩阵 M(q) 对称正定、Ṃ − 2C 反对称等性质',
          '递归牛顿-欧拉（RNEA，逆动力学）与铰接体算法（ABA，正动力学）：O(n) 复杂度，Pinocchio / MuJoCo 的核心',
          '接触与约束动力学：接触力 Jᵀf、互补约束（LCP）、冲击——足式与操作的关键难点',
          '欠驱动系统：控制输入数少于自由度数（单摆车、四足、无人机），动力学约束不能被抵消',
        ],
        formulas: [
          { latex: '\\frac{d}{dt}\\frac{\\partial L}{\\partial \\dot{q}} - \\frac{\\partial L}{\\partial q} = \\tau,\\qquad L = T(q,\\dot q) - V(q)', caption: '欧拉–拉格朗日方程' },
          { latex: 'M(q)\\,\\ddot{q} + C(q,\\dot{q})\\,\\dot{q} + g(q) = \\tau + J_c(q)^{\\top} f_c', caption: '机器人运动方程（含接触力）' },
        ],
        resources: [
          { title: 'Underactuated Robotics（Ch. 1–3 + Appendix: Multi-Body Dynamics）', by: 'Russ Tedrake · MIT', url: 'https://underactuated.mit.edu/', kind: 'book', note: '在线教材 + 每年更新的课程视频，机器人动力学与控制的必读', primary: true },
          { title: 'Modern Robotics（第 8 章 Dynamics of Open Chains）', by: 'Lynch & Park', url: 'https://hades.mech.northwestern.edu/index.php/Modern_Robotics', kind: 'book', note: '拉格朗日 + 牛顿-欧拉两条路线都讲' },
          { title: 'A Mathematical Introduction to Robotic Manipulation', by: 'Murray, Li, Sastry · Caltech', url: 'http://www.cds.caltech.edu/~murray/books/MLS/pdf/mls94-complete.pdf', kind: 'book', note: '免费 PDF，李群视角的经典，第 4 章动力学' },
          { title: 'Classical Dynamics（讲义）', by: 'David Tong · Cambridge', url: 'https://www.damtp.cam.ac.uk/user/tong/dynamics.html', kind: 'notes', note: '物理系视角的拉格朗日 / 哈密顿力学，补物理直觉' },
          { title: 'Pinocchio', by: 'Justin Carpentier 等 · INRIA', url: 'https://github.com/stack-of-tasks/pinocchio', kind: 'tool', note: '开源刚体动力学库（RNEA / ABA / 解析导数），用来验证你推的公式' },
          { title: 'MuJoCo', by: 'Google DeepMind', url: 'https://mujoco.readthedocs.io/', kind: 'tool', note: '免费开源物理引擎，文档的 Computation 章节讲清了接触求解' },
        ],
        quiz: ['质量矩阵 M(q) 为什么一定对称正定？它的物理含义是什么？', '为什么欠驱动系统不能用「计算力矩法」把动力学完全抵消？'],
        papers: ['humanoid', 'locomotion'],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'control',
    emoji: '🎛️',
    title: '经典控制与最优控制 / MPC',
    en: 'Classical & Optimal Control, MPC',
    intro:
      '有了模型就可以设计控制器。这条路线从 PID 和反馈线性化出发，经过 LQR、动态规划、轨迹优化，到达今天足式与操作机器人上广泛部署的 MPC 和全身控制。Russ Tedrake 的 Underactuated Robotics 与 CMU 16-745 是这一模块的两条主线。',
    prereq: ['modeling'],
    topics: [
      {
        id: 'feedback',
        title: '反馈控制基础与基于模型的关节控制',
        en: 'Feedback Control & Model-Based Joint Control',
        hours: 25,
        summary:
          '反馈的本质是「用误差修正动作」。先理解 PID、稳定性（极点 / 特征值）、李雅普诺夫函数，然后学会利用动力学模型做重力补偿、计算力矩（反馈线性化）、以及在任务空间（末端）而非关节空间做控制。',
        points: [
          'PID 的物理直觉与整定；为什么纯 PD 在有重力时会有稳态误差',
          '稳定性：线性系统看特征值，非线性系统用李雅普诺夫函数 V(x) > 0, V̇(x) < 0',
          '重力补偿 PD → 计算力矩法（反馈线性化）→ 任务空间 / 操作空间控制（Khatib）',
          '阻抗 / 导纳控制：让机器人表现得像弹簧-阻尼系统，是安全物理交互的基础',
          '被动性与鲁棒性：模型不准时会发生什么',
        ],
        formulas: [
          { latex: '\\tau = K_p (q_d - q) + K_d (\\dot{q}_d - \\dot{q}) + g(q)', caption: '重力补偿 PD 控制' },
          { latex: '\\tau = M(q)\\big(\\ddot{q}_d + K_d\\dot{e} + K_p e\\big) + C(q,\\dot q)\\dot q + g(q),\\quad e = q_d - q', caption: '计算力矩法：闭环变成 ë + K_d ė + K_p e = 0' },
        ],
        resources: [
          { title: 'Feedback Systems: An Introduction for Scientists and Engineers', by: 'Åström & Murray', url: 'https://fbswiki.org/', kind: 'book', note: '免费 PDF，反馈控制最好的现代入门教材', primary: true },
          { title: 'Control Bootcamp', by: 'Steve Brunton (YouTube)', url: 'https://www.youtube.com/playlist?list=PLMrJAkhIeNNR20Mz-VpzgfQs5zrYi085m', kind: 'video', note: '线性系统、可控性、LQR、卡尔曼滤波一条线讲完，每集 10 分钟' },
          { title: 'Modern Robotics（第 11 章 Robot Control）', by: 'Lynch & Park', url: 'https://hades.mech.northwestern.edu/index.php/Modern_Robotics', kind: 'book', note: '关节控制、计算力矩、力控与阻抗控制' },
          { title: 'Underactuated Robotics（Ch. 2–3：Pendulum, Acrobot & Cart-Pole）', by: 'Russ Tedrake · MIT', url: 'https://underactuated.mit.edu/pend.html', kind: 'book', note: '用最简单的系统建立「为什么线性反馈不够」的直觉' },
        ],
        quiz: ['计算力矩法要求模型精确，模型误差 10% 时闭环会怎样？', '阻抗控制与导纳控制的区别是什么？各适合什么硬件？'],
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
          { title: 'Underactuated Robotics（Ch. 7 Dynamic Programming, Ch. 8 LQR）', by: 'Russ Tedrake · MIT', url: 'https://underactuated.mit.edu/dp.html', kind: 'book', primary: true },
          { title: '16-745 Lectures 7–9: Pontryagin, LQR in 3 Ways, DP', by: 'Zac Manchester · CMU', url: 'https://optimalcontrol.ri.cmu.edu/lectures/', kind: 'video', note: '同一个 LQR 用三种方法推导，非常好的思维训练' },
          { title: 'AA203 Optimal and Learning-Based Control（讲义）', by: 'Marco Pavone · Stanford', url: 'https://stanfordasl.github.io/aa203/', kind: 'notes', note: '从最优控制到学习控制的完整讲义，数学严谨' },
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
          { title: 'Underactuated Robotics（Ch. 10 Trajectory Optimization）', by: 'Russ Tedrake · MIT', url: 'https://underactuated.mit.edu/trajopt.html', kind: 'book', primary: true },
          { title: '16-745 Lectures 11–13: Nonlinear TrajOpt, DDP, Direct Methods', by: 'Zac Manchester · CMU', url: 'https://optimalcontrol.ri.cmu.edu/lectures/', kind: 'video', note: '配套 Julia notebook 可以跑：github.com/Optimal-Control-16-745/lecture-notebooks' },
          { title: 'An Introduction to Trajectory Optimization: How to Do Your Own Direct Collocation', by: 'Matthew Kelly · SIAM Review', url: 'https://www.matthewpeterkelly.com/tutorials/trajectoryOptimization/index.html', kind: 'paper', note: '最友好的直接配点教程（作者主页：交互式教程 + SIAM Review 论文 PDF + OptimTraj 代码）' },
          { title: 'Synthesis and Stabilization of Complex Behaviors through Online Trajectory Optimization', by: 'Tassa, Erez, Todorov · IROS 2012', url: 'https://homes.cs.washington.edu/~todorov/papers/TassaIROS12.pdf', kind: 'paper', note: 'iLQR 用于全身控制的经典论文' },
          { title: 'Crocoddyl', by: 'LAAS-CNRS / INRIA', url: 'https://github.com/loco-3d/crocoddyl', kind: 'tool', note: '基于 Pinocchio 的 DDP 求解器，足式 / 操作示例齐全' },
          { title: 'CasADi', by: 'Andersson 等', url: 'https://web.casadi.org/', kind: 'tool', note: '符号建模 + 自动微分 + IPOPT，写直接配点最方便的工具' },
        ],
        quiz: ['直接配点为什么比单打靶数值上更稳定？代价是什么？', 'iLQR 与 DDP 的区别在哪一项？为什么 iLQR 通常够用？'],
        papers: ['trajectory optimization', 'whole-body control'],
      },
      {
        id: 'mpc',
        title: '模型预测控制（MPC）与全身控制',
        en: 'Model Predictive Control & Whole-Body Control',
        hours: 30,
        summary:
          'MPC 的思想极简：每个控制周期在线求解一个有限时域轨迹优化，只执行第一步，下一周期重来。它天然处理约束、能利用最新状态估计，是当今四足 / 人形机器人（MIT Cheetah、ANYmal、Atlas）运动控制的骨干。全身控制（WBC）则在更高频率下用 QP 把 MPC 的期望分配到各个关节和接触力上。',
        points: [
          '滚动时域原理、稳定性与可行性（终端代价 / 终端约束）、鲁棒 MPC 与管道 MPC 概览',
          '线性 / 凸 MPC：写成 QP，用 OSQP / qpOASES 在 kHz 级实时求解',
          '非线性 MPC：实时迭代（RTI）、SQP 只做一步、acados / OCS2 等框架',
          '足式机器人的简化模型：线性倒立摆（LIP）、单刚体模型（SRBD）+ 凸 MPC（MIT Cheetah 3）、质心动力学',
          '全身控制 QP：任务优先级（分层 QP / 加权 QP）、接触摩擦锥约束、力矩限制',
          'MPC 与学习的结合：学习代价函数、学习动力学残差、把策略当作 warm start',
        ],
        formulas: [
          { latex: '\\min_{u_{0:N-1}} \\sum_{k=0}^{N-1} \\|x_k - x_k^{\\text{ref}}\\|_Q^2 + \\|u_k\\|_R^2\\;\\text{ s.t. } x_{k+1} = Ax_k + Bu_k,\\; u\\in\\mathcal U,\\; x\\in\\mathcal X;\\quad\\text{执行 } u_0^{*}', caption: '线性 MPC：每步求解一个 QP，只执行第一步' },
          { latex: 'm\\ddot{p} = \\sum_i f_i - mg,\\qquad \\frac{d}{dt}(I\\omega) = \\sum_i (r_i - p)\\times f_i', caption: '单刚体（SRBD）质心动力学，四足凸 MPC 的模型' },
        ],
        resources: [
          { title: 'Model Predictive Control: Theory, Computation, and Design (2nd ed.)', by: 'Rawlings, Mayne, Diehl', url: 'https://sites.engineering.ucsb.edu/~jbraw/mpc/', kind: 'book', note: '免费 PDF，MPC 理论最权威的教材，第 1–2 章建立框架', primary: true },
          { title: 'Predictive Control for Linear and Hybrid Systems', by: 'Borrelli, Bemporad, Morari · UC Berkeley', url: 'https://cse.lab.imtlucca.it/~bemporad/publications/papers/BBMbook.pdf', kind: 'book', note: '免费 PDF + Berkeley ME C231A 课件，凸 MPC 与显式 MPC' },
          { title: '16-745 Lecture 10: Convex MPC；Lecture 17 & 20: Legged Robots, How to Walk', by: 'Zac Manchester · CMU', url: 'https://optimalcontrol.ri.cmu.edu/lectures/', kind: 'video' },
          { title: 'Dynamic Locomotion in the MIT Cheetah 3 Through Convex Model-Predictive Control', by: 'Di Carlo, Wensing, Katz, Bledt, Kim · IROS 2018', url: 'https://dspace.mit.edu/handle/1721.1/138000', kind: 'paper', note: '四足凸 MPC 的奠基论文，开源实现见 mit-biomimetics/Cheetah-Software' },
          { title: 'Perceptive Locomotion through Nonlinear MPC', by: 'Grandia, Jenelten, Yang, Farshidian, Hutter · T-RO 2023', url: 'https://arxiv.org/abs/2208.08373', kind: 'paper', note: 'ANYmal 的感知非线性 MPC，配套开源框架 OCS2' },
          { title: 'acados', by: 'Verschueren, Frison 等 · Freiburg', url: 'https://docs.acados.org/', kind: 'tool', note: '嵌入式实时非线性 MPC 求解器，Python 接口友好' },
        ],
        quiz: ['为什么 MPC 只执行第一步就重解？它相比一次性轨迹优化 + TVLQR 的优势和代价各是什么？', '四足机器人为什么可以用单刚体模型做 MPC 而忽略腿的动力学？'],
        papers: ['mpc', 'model predictive', 'locomotion'],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'planning',
    emoji: '🗺️',
    title: '运动规划',
    en: 'Motion Planning',
    intro:
      '控制解决「如何跟随一条轨迹」，规划解决「这条轨迹从哪来」。在高维构型空间里避开障碍找到可行路径，是采样规划（RRT / PRM）与优化规划（CHOMP / TrajOpt）的领地。这一模块篇幅较短，但对理解操作与导航系统必不可少。',
    prereq: ['modeling'],
    topics: [
      {
        id: 'motion-planning',
        title: '构型空间与采样 / 优化规划',
        en: 'Configuration Space, Sampling- & Optimization-Based Planning',
        hours: 25,
        summary:
          '把机器人抽象成构型空间中的一个点，障碍物映射成 C-障碍，规划就成了在高维空间找路。图搜索（A*）适合低维离散问题；随机采样（PRM、RRT、RRT*）在高维空间实用；优化规划把碰撞代价光滑化后直接做梯度下降。',
        points: [
          '构型空间 C、C-障碍、自由空间；碰撞检测是规划器的主要开销',
          '图搜索：Dijkstra、A*、启发式的可采纳性；格点 / 状态栅格规划',
          '采样规划：PRM、RRT、RRT-Connect、RRT*（渐近最优）、Informed RRT*',
          '优化规划：CHOMP、STOMP、TrajOpt——把轨迹优化用于避障',
          '运动学约束下的规划（kinodynamic）、时间参数化（TOPP-RA）、以及规划与 MPC 的分工',
        ],
        resources: [
          { title: 'Planning Algorithms', by: 'Steven LaValle · UIUC', url: 'http://lavalle.pl/planning/', kind: 'book', note: '免费在线全书，第 5–6 章采样规划是核心', primary: true },
          { title: 'Modern Robotics（第 10 章 Motion Planning）', by: 'Lynch & Park', url: 'https://hades.mech.northwestern.edu/index.php/Modern_Robotics', kind: 'book', note: '一章讲清 C-空间、A*、RRT、势场法' },
          { title: 'Robotic Manipulation（Ch. 7 Motion Planning）', by: 'Russ Tedrake · MIT', url: 'https://manipulation.csail.mit.edu/trajectories.html', kind: 'book', note: '采样规划 + 优化规划 + 图形化 Drake 示例' },
          { title: 'OMPL — Open Motion Planning Library', by: 'Kavraki Lab · Rice', url: 'https://ompl.kavrakilab.org/', kind: 'tool', note: '几十种采样规划器的参考实现，MoveIt 的后端' },
        ],
        quiz: ['RRT 为什么天然偏向探索未访问区域（Voronoi bias）？', 'RRT* 与 RRT 相比多做了哪两步？为什么因此渐近最优？'],
        papers: ['motion planning', 'navigation'],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'rl',
    emoji: '🧠',
    title: '强化学习与机器人学习',
    en: 'Reinforcement Learning & Robot Learning',
    intro:
      '当模型不准、接触复杂或任务难以写成代价函数时，从数据中学习策略成为主流。RL 与最优控制共享同一套数学（MDP、贝尔曼方程、值函数），区别在于用采样代替模型。这一模块从表格 RL 到深度 RL，再到今天机器人上真正好用的两条路：大规模并行仿真 sim-to-real，以及模仿学习 / 视觉-语言-动作（VLA）模型。',
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
          '基于模型的 RL：学习动力学模型 + 规划（PETS、MBPO、Dreamer 系列世界模型）',
          '实践：奖励设计、观测归一化、并行环境、随机种子的方差——Spinning Up 的实现细节',
        ],
        formulas: [
          { latex: '\\nabla_\\theta J(\\theta) = \\mathbb{E}_{\\pi_\\theta}\\Big[\\sum_t \\nabla_\\theta \\log \\pi_\\theta(a_t\\mid s_t)\\,\\hat A_t\\Big]', caption: '策略梯度定理（带优势函数）' },
          { latex: 'L^{\\text{CLIP}}(\\theta) = \\mathbb{E}_t\\Big[\\min\\big(r_t(\\theta)\\hat A_t,\\;\\operatorname{clip}(r_t(\\theta),1-\\epsilon,1+\\epsilon)\\hat A_t\\big)\\Big],\\quad r_t = \\tfrac{\\pi_\\theta(a_t|s_t)}{\\pi_{\\theta_{\\text{old}}}(a_t|s_t)}', caption: 'PPO 裁剪目标' },
        ],
        resources: [
          { title: 'CS285: Deep Reinforcement Learning', by: 'Sergey Levine · UC Berkeley', url: 'https://rail.eecs.berkeley.edu/deeprlcourse/', kind: 'course', note: '完整视频与作业，机器人视角的深度 RL 第一课', primary: true },
          { title: 'Spinning Up in Deep RL', by: 'OpenAI', url: 'https://spinningup.openai.com/', kind: 'notes', note: '关键论文清单 + 干净的 PyTorch 参考实现（VPG / TRPO / PPO / DDPG / TD3 / SAC）' },
          { title: 'Proximal Policy Optimization Algorithms', by: 'Schulman 等 · 2017', url: 'https://arxiv.org/abs/1707.06347', kind: 'paper' },
          { title: 'Soft Actor-Critic', by: 'Haarnoja 等 · 2018', url: 'https://arxiv.org/abs/1801.01290', kind: 'paper' },
          { title: 'Mastering Diverse Domains through World Models (DreamerV3)', by: 'Hafner 等 · 2023', url: 'https://arxiv.org/abs/2301.04104', kind: 'paper', note: '基于模型 RL / 世界模型路线的代表' },
        ],
        quiz: ['为什么减去一个只依赖状态的基线不改变策略梯度的期望，却能降低方差？', 'PPO 的裁剪在防止什么？它和 TRPO 的 KL 约束是什么关系？'],
        papers: ['reinforcement learning', 'world model'],
      },
      {
        id: 'sim2real',
        title: '大规模并行仿真与 Sim-to-Real 运动控制',
        en: 'Massively Parallel Simulation & Sim-to-Real Locomotion',
        hours: 30,
        summary:
          '2019 年后，四足 / 人形机器人的运动控制被「GPU 上数千个并行环境 + PPO + 域随机化 + 教师-学生蒸馏」这套配方彻底改变。理解为什么这套方法能跨越现实差距（reality gap），以及它与 MPC 各自的优势，是当代机器人从业者的必修课。',
        points: [
          '现实差距的来源：接触与摩擦、执行器动力学、延迟、传感噪声；对策是域随机化与执行器网络',
          '观测设计：本体感受历史、相位 / 命令输入、特权信息与教师-学生（privileged learning）',
          '奖励塑形与课程学习；地形课程；对称性利用',
          '并行仿真器：Isaac Gym / Isaac Lab、MuJoCo MJX、Genesis；训练几分钟到几小时',
          '与 MPC 对比：鲁棒性、计算成本、可解释性、约束处理；混合方法（RL 输出 MPC 参考 / 残差）',
        ],
        resources: [
          { title: 'Learning agile and dynamic motor skills for legged robots', by: 'Hwangbo 等 · Science Robotics 2019', url: 'https://arxiv.org/abs/1901.08652', kind: 'paper', note: 'ANYmal 上 sim-to-real 的里程碑，执行器网络的提出', primary: true },
          { title: 'Learning quadrupedal locomotion over challenging terrain', by: 'Lee, Hwangbo, Wellhausen, Koltun, Hutter · Science Robotics 2020', url: 'https://arxiv.org/abs/2010.11251', kind: 'paper', note: '教师-学生 + 地形课程' },
          { title: 'Learning to Walk in Minutes Using Massively Parallel Deep RL', by: 'Rudin, Hoeller, Reist, Hutter · CoRL 2021', url: 'https://arxiv.org/abs/2109.11978', kind: 'paper', note: '配套开源 legged_gym + rsl_rl，是大多数后续工作的代码起点' },
          { title: 'Isaac Lab', by: 'NVIDIA', url: 'https://isaac-sim.github.io/IsaacLab/', kind: 'tool', note: '开源 GPU 并行机器人学习框架（需 NVIDIA GPU）' },
          { title: 'MuJoCo Playground', by: 'Google DeepMind', url: 'https://github.com/google-deepmind/mujoco_playground', kind: 'tool', note: '基于 MJX 的开源 sim-to-real 环境集合，附四足 / 人形训练配方' },
          { title: 'CS287 Advanced Robotics', by: 'Pieter Abbeel · UC Berkeley', url: 'https://people.eecs.berkeley.edu/~pabbeel/cs287-fa19/', kind: 'course', note: '把最优控制、估计与 RL 放在一门课里讲的经典，视频公开' },
        ],
        quiz: ['域随机化为什么能提升迁移？随机化范围过大会有什么后果？', '「特权信息」是什么？教师-学生蒸馏为什么能让学生策略只用本体感受就能工作？'],
        papers: ['sim-to-real', 'locomotion', 'humanoid'],
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
          { title: 'CS285 Lecture 2: Supervised Learning of Behaviors（模仿学习）', by: 'Sergey Levine · UC Berkeley', url: 'https://rail.eecs.berkeley.edu/deeprlcourse/', kind: 'video', note: 'BC、DAgger、协变量偏移的理论', primary: true },
          { title: 'Robotic Manipulation（Reinforcement Learning & Imitation 章节）', by: 'Russ Tedrake · MIT', url: 'https://manipulation.csail.mit.edu/rl.html', kind: 'book', note: '从控制视角看行为克隆与扩散策略' },
          { title: 'Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware (ACT / ALOHA)', by: 'Zhao, Kumar, Levine, Finn · RSS 2023', url: 'https://arxiv.org/abs/2304.13705', kind: 'paper' },
          { title: 'Diffusion Policy: Visuomotor Policy Learning via Action Diffusion', by: 'Chi 等 · RSS 2023', url: 'https://arxiv.org/abs/2303.04137', kind: 'paper' },
          { title: 'OpenVLA: An Open-Source Vision-Language-Action Model', by: 'Kim 等 · CoRL 2024', url: 'https://arxiv.org/abs/2406.09246', kind: 'paper' },
          { title: 'π0: A Vision-Language-Action Flow Model for General Robot Control', by: 'Black 等 · Physical Intelligence 2024', url: 'https://arxiv.org/abs/2410.24164', kind: 'paper' },
          { title: 'LeRobot', by: 'Hugging Face', url: 'https://github.com/huggingface/lerobot', kind: 'tool', note: '开源的数据集 / 策略（ACT、Diffusion、VLA）训练与部署库' },
        ],
        quiz: ['行为克隆的误差为什么会随时间步累积？DAgger 如何从理论上解决它？', '为什么扩散模型比高斯回归更适合表示示教动作分布？'],
        papers: ['vla', 'vision-language-action', 'imitation learning', 'diffusion'],
      },
    ],
  },

  /* ------------------------------------------------------------------ */
  {
    id: 'estimation',
    emoji: '📡',
    title: '状态估计',
    en: 'State Estimation',
    intro:
      '控制器和策略都假设「知道当前状态」，但传感器只给出带噪声的间接观测。状态估计就是用概率把模型预测和观测融合起来：从卡尔曼滤波到粒子滤波、从 IMU 预积分到因子图 SLAM、再到足式机器人的腿-IMU 融合。Tim Barfoot 的免费教材是这一模块的主线。',
    prereq: ['modeling'],
    topics: [
      {
        id: 'bayes-kalman',
        title: '贝叶斯滤波与卡尔曼滤波家族',
        en: 'Bayes Filter, KF / EKF / UKF',
        hours: 30,
        summary:
          '贝叶斯滤波用「预测-更新」两步递推地维护状态的后验分布。线性高斯情形下就是卡尔曼滤波（KF）；非线性系统靠线性化（EKF）或采样（UKF）。理解卡尔曼增益如何在模型与观测之间权衡，是所有后续方法的基础。',
        points: [
          '贝叶斯滤波的预测（运动模型）与更新（观测模型）两步',
          'KF：高斯下的闭式解，卡尔曼增益、创新（innovation）、协方差更新；KF 是最优线性估计器',
          'EKF：雅可比线性化，一致性问题；误差状态 EKF（ESKF）与旋转的正确处理',
          'UKF / sigma 点：不求雅可比的非线性传播；粒子滤波：非高斯、多模态',
          '可观性：哪些状态从观测中「看得见」，为什么纯 IMU 无法估计绝对位置',
        ],
        formulas: [
          { latex: '\\overline{\\text{bel}}(x_t) = \\int p(x_t\\mid u_t, x_{t-1})\\,\\text{bel}(x_{t-1})\\,dx_{t-1},\\qquad \\text{bel}(x_t) = \\eta\\, p(z_t\\mid x_t)\\,\\overline{\\text{bel}}(x_t)', caption: '贝叶斯滤波：预测 → 更新' },
          { latex: 'K = \\bar P H^{\\top}(H\\bar P H^{\\top} + R)^{-1},\\quad \\hat x = \\bar x + K(z - H\\bar x),\\quad P = (I - KH)\\bar P', caption: '卡尔曼滤波更新步' },
        ],
        resources: [
          { title: 'State Estimation for Robotics', by: 'Tim Barfoot · U of Toronto', url: 'http://asrl.utias.utoronto.ca/~tdb/bib/barfoot_ser17.pdf', kind: 'book', note: '免费 PDF，第 3–4 章线性 / 非线性高斯估计，第 6–8 章李群上的估计', primary: true },
          { title: 'Kalman and Bayesian Filters in Python', by: 'Roger Labbe', url: 'https://github.com/rlabbe/Kalman-and-Bayesian-Filters-in-Python', kind: 'book', note: '交互式 Jupyter 教材，边跑代码边理解 KF / EKF / UKF / 粒子滤波' },
          { title: 'Mobile Sensing and Robotics（讲座视频）', by: 'Cyrill Stachniss · Bonn', url: 'https://www.ipb.uni-bonn.de/msr2-2021/', kind: 'video', note: '贝叶斯滤波、EKF、粒子滤波、SLAM 完整视频课' },
          { title: 'Control Bootcamp: Kalman Filter 部分', by: 'Steve Brunton', url: 'https://www.youtube.com/playlist?list=PLMrJAkhIeNNR20Mz-VpzgfQs5zrYi085m', kind: 'video', note: '把 KF 讲成 LQR 的对偶，控制视角' },
        ],
        quiz: ['卡尔曼增益趋于 0 和趋于 H⁻¹ 分别对应什么情形？', 'EKF 处理旋转时为什么要用误差状态而不是直接对四元数做加法？'],
      },
      {
        id: 'factor-graph',
        title: '非线性最小二乘、因子图与 SLAM',
        en: 'Nonlinear Least Squares, Factor Graphs & SLAM',
        hours: 30,
        summary:
          '滤波只保留当前状态，平滑则同时优化一段轨迹的所有状态。把 MAP 估计写成非线性最小二乘，用因子图表示变量与测量的关系，利用稀疏性高效求解——这是现代 SLAM、视觉惯性里程计（VIO）、多传感器融合的统一框架。',
        points: [
          'MAP 估计 = 非线性最小二乘；高斯-牛顿与 Levenberg–Marquardt；鲁棒核函数处理外点',
          '因子图：变量节点 + 因子节点；稀疏信息矩阵与消元顺序；iSAM2 增量求解',
          'IMU 预积分：在因子图里高效使用高频 IMU',
          '视觉 / 激光 SLAM 前端概览：特征、数据关联、回环检测；位姿图优化',
          '在流形上优化：SE(3) 的 ⊞ 参数化，避免过参数化与奇异',
        ],
        formulas: [
          { latex: 'x^{*} = \\arg\\min_x \\sum_i \\big\\|h_i(x) - z_i\\big\\|_{\\Sigma_i}^2,\\qquad \\|e\\|_\\Sigma^2 = e^{\\top}\\Sigma^{-1}e', caption: 'MAP 估计写成加权非线性最小二乘' },
          { latex: '(J^{\\top}\\Sigma^{-1}J)\\,\\delta x = -J^{\\top}\\Sigma^{-1} e(x)', caption: '高斯-牛顿法的正规方程（稀疏）' },
        ],
        resources: [
          { title: 'Factor Graphs for Robot Perception', by: 'Dellaert & Kaess · Foundations and Trends in Robotics', url: 'https://www.cs.cmu.edu/~kaess/pub/Dellaert17fnt.pdf', kind: 'book', note: '免费 PDF，因子图与 SLAM 的权威综述', primary: true },
          { title: 'State Estimation for Robotics（第 4 章批量估计，第 9 章位姿与地图）', by: 'Tim Barfoot', url: 'http://asrl.utias.utoronto.ca/~tdb/bib/barfoot_ser17.pdf', kind: 'book' },
          { title: 'On-Manifold Preintegration for Real-Time Visual-Inertial Odometry', by: 'Forster, Carlone, Dellaert, Scaramuzza · T-RO 2017', url: 'https://arxiv.org/abs/1512.02363', kind: 'paper', note: 'IMU 预积分的标准参考' },
          { title: 'GTSAM', by: 'Georgia Tech / Borglab', url: 'https://gtsam.org/', kind: 'tool', note: '因子图库，官方教程 "Factor Graphs and GTSAM" 是最好的入门' },
          { title: 'Past, Present, and Future of SLAM: Toward the Robust-Perception Age', by: 'Cadena 等 · T-RO 2016', url: 'https://arxiv.org/abs/1606.05830', kind: 'paper', note: 'SLAM 领域综述' },
        ],
        quiz: ['为什么平滑（批量估计）比滤波精度更高？代价是什么？', '因子图的信息矩阵为什么稀疏？稠密化（fill-in）从哪里来？'],
        papers: ['slam', 'visual-inertial', 'odometry'],
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
];

/** 全部主题的扁平列表，方便统计与进度计算 */
export const allTopics = modules.flatMap((m) => m.topics.map((t) => ({ ...t, module: m.id })));
export const totalHours = allTopics.reduce((s, t) => s + t.hours, 0);

export const kindMeta: Record<ResourceKind, { icon: string; label: string }> = {
  book: { icon: '📘', label: '教材' },
  course: { icon: '🎓', label: '课程' },
  video: { icon: '🎬', label: '视频' },
  notes: { icon: '📝', label: '讲义' },
  paper: { icon: '📄', label: '论文' },
  tool: { icon: '🧰', label: '工具' },
};
