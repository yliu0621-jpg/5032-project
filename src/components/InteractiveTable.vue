<template>
  <div class="card">
    <div class="card-body">
      <!-- Search Controls -->
      <div class="row mb-3">
        <div class="col-md-6">
          <div class="input-group">
            <span class="input-group-text">
              <i class="bi bi-search"></i>
            </span>
            <input
              type="text"
              class="form-control"
              placeholder="Global search..."
              v-model="globalSearch"
              @input="resetPagination"
            />
          </div>
        </div>
        <div class="col-md-6 text-end">
          <span class="text-muted">
            {{ paginatedData.length }} of {{ filteredData.length }} results
          </span>
        </div>
      </div>

      <!-- Column Search Toggle -->
      <div class="row mb-3" v-if="searchableColumns.length > 0">
        <div class="col-12">
          <button
            class="btn btn-sm btn-outline-primary"
            @click="toggleColumnSearch"
          >
            <i class="bi bi-funnel me-1"></i>
            {{ showColumnSearch ? 'Hide' : 'Show' }} Column Search
          </button>
        </div>
      </div>

      <!-- Column-specific searches -->
      <div class="row mb-3" v-if="showColumnSearch && searchableColumns.length > 0">
        <div class="col-12">
          <div class="row">
            <div
              v-for="column in searchableColumns"
              :key="column.key"
              class="col-md-4 mb-2"
            >
              <input
                type="text"
                class="form-control form-control-sm"
                :placeholder="`Search ${column.label}...`"
                v-model="columnSearches[column.key]"
                @input="resetPagination"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="table-responsive">
        <table class="table table-striped">
          <thead>
            <tr>
              <th
                v-for="column in columns"
                :key="column.key"
                @click="sortBy(column.key)"
                style="cursor: pointer;"
              >
                {{ column.label }}
                <span v-if="sortColumn === column.key" class="ms-1">
                  <i :class="sortOrder === 'asc' ? 'bi bi-arrow-up' : 'bi bi-arrow-down'"></i>
                </span>
                <span v-else class="ms-1 text-muted">
                  <i class="bi bi-arrow-down-up"></i>
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="paginatedData.length === 0">
              <td :colspan="columns.length" class="text-center py-4">
                <div v-if="filteredData.length === 0">
                  No data found matching your search criteria.
                </div>
                <div v-else>
                  No data available.
                </div>
              </td>
            </tr>
            <tr v-for="row in paginatedData" :key="getRowKey(row)">
              <td v-for="column in columns" :key="column.key">
                <slot :name="`cell-${column.key}`" :row="row" :value="row[column.key]">
                  {{ formatCellValue(row[column.key], column) }}
                </slot>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="d-flex justify-content-between align-items-center mt-3">
        <div class="d-flex align-items-center">
          <label class="me-2">Rows per page:</label>
          <select class="form-select form-select-sm" style="width: auto;" v-model="rowsPerPage" @change="resetPagination">
            <option v-for="option in rowsPerPageOptions" :key="option" :value="option">
              {{ option }}
            </option>
          </select>
        </div>

        <nav>
          <ul class="pagination mb-0">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <button class="page-link" @click="previousPage" :disabled="currentPage === 1">
                <i class="bi bi-chevron-left"></i> Previous
              </button>
            </li>

            <li
              v-for="page in visiblePages"
              :key="page"
              class="page-item"
              :class="{ active: page === currentPage }"
            >
              <button class="page-link" @click="goToPage(page)" v-if="page !== '...'">
                {{ page }}
              </button>
              <span class="page-link" v-else>...</span>
            </li>

            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <button class="page-link" @click="nextPage" :disabled="currentPage === totalPages">
                Next <i class="bi bi-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => []
  },
  columns: {
    type: Array,
    required: true,
    default: () => []
  },
  rowsPerPage: {
    type: Number,
    default: 10
  },
  searchableColumns: {
    type: Array,
    default: () => []
  },
  rowKey: {
    type: String,
    default: 'id'
  },
  initialSortColumn: {
    type: String,
    default: ''
  },
  initialSortOrder: {
    type: String,
    default: 'asc',
    validator: (value) => ['asc', 'desc'].includes(value)
  }
})

// Reactive state
const globalSearch = ref('')
const columnSearches = ref({})
const sortColumn = ref(props.initialSortColumn)
const sortOrder = ref(props.initialSortOrder)
const currentPage = ref(1)
const rowsPerPage = ref(props.rowsPerPage)
const showColumnSearch = ref(false)

// Options for rows per page
const rowsPerPageOptions = [5, 10, 25, 50]

// Initialize column searches
onMounted(() => {
  props.searchableColumns.forEach(column => {
    columnSearches.value[column.key] = ''
  })
})

// Computed properties
const filteredData = computed(() => {
  let result = [...props.data]

  // Apply global search
  if (globalSearch.value) {
    const searchTerm = globalSearch.value.toLowerCase()
    result = result.filter(row => {
      return props.columns.some(column => {
        const value = row[column.key]
        return value != null && value.toString().toLowerCase().includes(searchTerm)
      })
    })
  }

  // Apply column-specific searches
  props.searchableColumns.forEach(column => {
    const searchValue = columnSearches.value[column.key]
    if (searchValue) {
      const searchTerm = searchValue.toLowerCase()
      result = result.filter(row => {
        const value = row[column.key]
        return value != null && value.toString().toLowerCase().includes(searchTerm)
      })
    }
  })

  return result
})

const sortedData = computed(() => {
  if (!sortColumn.value) return filteredData.value

  return [...filteredData.value].sort((a, b) => {
    let valueA = a[sortColumn.value]
    let valueB = b[sortColumn.value]

    // Handle null/undefined values
    if (valueA === null || valueA === undefined) valueA = ''
    if (valueB === null || valueB === undefined) valueB = ''

    // Compare based on data type
    let comparison = 0
    if (typeof valueA === 'number' && typeof valueB === 'number') {
      comparison = valueA - valueB
    } else {
      comparison = valueA.toString().localeCompare(valueB.toString())
    }

    return sortOrder.value === 'asc' ? comparison : -comparison
  })
})

const totalPages = computed(() => {
  return Math.ceil(sortedData.value.length / rowsPerPage.value)
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * rowsPerPage.value
  const end = start + rowsPerPage.value
  return sortedData.value.slice(start, end)
})

const visiblePages = computed(() => {
  const total = totalPages.value
  const current = currentPage.value
  const delta = 2

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  const range = []
  const rangeWithDots = []

  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i)
  }

  if (current - delta > 2) {
    rangeWithDots.push(1, '...')
  } else {
    rangeWithDots.push(1)
  }

  rangeWithDots.push(...range)

  if (current + delta < total - 1) {
    rangeWithDots.push('...', total)
  } else {
    rangeWithDots.push(total)
  }

  return rangeWithDots
})

// Methods
const sortBy = (column) => {
  if (sortColumn.value === column) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortColumn.value = column
    sortOrder.value = 'asc'
  }
  resetPagination()
}

const resetPagination = () => {
  currentPage.value = 1
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const toggleColumnSearch = () => {
  showColumnSearch.value = !showColumnSearch.value
}

const getRowKey = (row) => {
  return row[props.rowKey] || JSON.stringify(row)
}

const formatCellValue = (value, column) => {
  if (value == null) return ''

  if (column.formatter && typeof column.formatter === 'function') {
    return column.formatter(value)
  }

  return value
}

// Watch for data changes
watch(() => props.data, () => {
  resetPagination()
}, { deep: true })

// Watch for rows per page changes
watch(rowsPerPage, () => {
  resetPagination()
})
</script>
