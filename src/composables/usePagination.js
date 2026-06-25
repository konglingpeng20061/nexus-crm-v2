import { ref, computed } from 'vue'

export function usePagination(defaultPageSize = 10) {
  const page = ref(1)
  const pageSize = ref(defaultPageSize)
  const total = ref(0)

  const pageCount = computed(() => Math.max(1, Math.ceil(total.value / pageSize.value)))

  function setTotal(val) {
    total.value = val
  }

  function resetPage() {
    page.value = 1
  }

  function changePage(val) {
    page.value = val
  }

  function changePageSize(val) {
    pageSize.value = val
    resetPage()
  }

  return {
    page,
    pageSize,
    total,
    pageCount,
    setTotal,
    resetPage,
    changePage,
    changePageSize
  }
}
