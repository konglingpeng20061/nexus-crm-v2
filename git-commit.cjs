const git = require('isomorphic-git')
const fs = require('fs')
const path = require('path')

const dir = 'E:\\klp\\nexus-crm-v2-main'

async function main() {
  const files = [
    'src/mock/database/opportunities.js',
    'src/mock/database/seed.js',
    'src/mock/database/store.js',
    'src/mock/database/dashboard.js',
    'src/mock/database/customers.js',
    'src/mock/handlers/index.js',
    'src/router/index.js',
    'src/api/opportunity.js',
    'src/views/opportunities/OpportunityListView.vue',
    'src/views/opportunities/OpportunityDetailView.vue',
    'src/views/opportunities/OpportunityBoardView.vue',
    'src/views/opportunities/components/OpportunityFormDialog.vue',
    'src/views/opportunities/components/OpportunityCard.vue'
  ]

  const status = await git.statusMatrix({ fs, dir })
  const toAdd = status.filter(([filepath, head, workdir, stage]) => workdir !== head || stage !== head)
  for (const [filepath] of toAdd) {
    console.log('Adding:', filepath)
  }

  if (toAdd.length === 0) {
    console.log('No changes to commit')
    return
  }

  await git.add({ fs, dir, filepath: toAdd.map(f => f[0]) })

  const sha = await git.commit({
    fs,
    dir,
    author: { name: 'NexusCRM Dev', email: 'dev@nexus-crm.com' },
    message: 'feat(opportunity): 实现商机模块全部功能\n\n- 商机列表：组合查询、分页、统计卡片\n- 商机CRUD：新增、编辑、删除、详情\n- 阶段状态机：定义六阶段流转规则\n- 阶段推进：独享PATCH接口，同步概率与计划\n- 销售看板：六列横向滚动看板，支持卡内推进\n- 种子数据：48条商机，六阶段各8条，含阶段记录'
  })

  console.log('Commit created:', sha)
}

main().catch(console.error)
