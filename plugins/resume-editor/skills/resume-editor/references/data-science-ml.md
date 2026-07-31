# 数据科学 / 机器学习岗位证据手册

先以当前 JD 对问题类型、模型职责和生产深度的要求为准。本手册不默认研究、建模、工程化或某一工具链必然更重要。

## 适用角色

- Data Scientist、Applied Scientist、Decision Scientist
- Machine Learning Scientist / Engineer 中以建模和评估为主的岗位
- NLP、forecasting、recommendation、optimization、experimentation 等分析建模岗位

## JD 信号

- **问题定义**：prediction、ranking、forecast、optimization、causal inference、experiment
- **数据与特征**：structured/unstructured、feature engineering、labeling、sampling、data leakage
- **模型质量**：baseline、validation、offline/online metrics、robustness、interpretability
- **交付与运行**：deployment、pipeline、monitoring、latency、retraining、MLOps
- **研究与沟通**：literature、prototype、publication、explain findings、stakeholder

先判断 JD 要的是研究探索、业务建模、生产工程还是其组合，再选择证据。

## 优先呈现的证据

1. 说明问题、预测/决策目标和成功标准，避免从算法名称起笔。
2. 展示数据准备、基线、验证设计、误差分析和模型选择依据。
3. 写清离线指标与真实使用结果的关系；没有线上验证时明确为离线结果。
4. 若 JD 强调生产，前置部署、接口、监控、可靠性、成本和维护责任。
5. 若 JD 强调研究，前置方法新颖性、实验严谨性、复现和知识传播。
6. 若 JD 强调业务，前置采用者、决策流程和可解释建议。
7. 框架、语言和平台只写真实使用范围；不硬编码任何技术为必需。

## 可量化维度

- 数据：样本量、特征数、数据模态、类别比例、时间或地域覆盖
- 模型：相对基线改善、置信区间、误差分层、校准、稳定性
- 运行：延迟、吞吐、可用性、推理/训练成本、更新频率
- 实验：实验数量、重复次数、对照设计、统计功效或不确定性
- 交付：上线范围、使用团队、自动化比例、从原型到生产的周期
- 业务：收入、成本、风险、转化、留存或运营指标，仅在归因可信时使用

同时写明指标名称、比较基线和评估场景；无法核实的数字标记为待确认。

## 常见误写与禁编造

- 不把课程、Notebook 或原型写成生产系统。
- 不把训练指标当作独立测试、线上实验或业务影响。
- 不省略基线、验证集或时间切分，却宣称模型“显著更优”。
- 不虚构部署规模、模型提升、成本节省、专利、论文或所有权。
- 不把使用 API/预训练模型写成独立研发基础模型。
- 不把团队共同成果全部归于个人；区分负责、协作和贡献。
- 不为匹配 JD 添加未使用的模型、框架、云平台或工程实践。

## Source basis

Role framing informed by [O*NET OnLine — Data Scientists (15-2051.00)](https://www.onetonline.org/link/summary/15-2051.00), accessed 2026-07-31. O*NET is a role baseline; the supplied JD controls prioritization.
