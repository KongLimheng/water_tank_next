// components/ProductPricePDF.tsx
import { ProductList } from '@/types'
import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from '@react-pdf/renderer'
import React from 'react'

interface GroupedData {
  vertical: ProductList[]
  horizontal: ProductList[]
}

interface ProductPricePDFProps {
  products: ProductList[]
  groupedData: {
    [key: string]: GroupedData
  }
  bannerUrl?: string
  isAuthenticated: boolean
}

const styles = StyleSheet.create({
  page: {
    padding: 10,
    fontFamily: 'KantumruyPro',
    fontSize: 10,
  },
  banner: {
    width: '100%',
    marginBottom: 15,
    objectFit: 'contain' as const,
  },
  section: {
    marginBottom: 20,
    borderWidth: 0.3,
    borderColor: '#94a3b8',
    borderStyle: 'solid',
    overflow: 'hidden',
    width: '100%',
  },
  sectionHeader: {
    backgroundColor: '#f8fafc',
    padding: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#94a3b8',
    borderBottomStyle: 'solid',
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: 'bold' as const,
    color: '#1e3a8a',
    textAlign: 'center' as const,
  },
  tableHeader: {
    backgroundColor: '#f1f5f9',
    flexDirection: 'row' as const,
    borderBottomWidth: 0.8,
    borderBottomColor: '#94a3b8',
    borderBottomStyle: 'solid',
  },
  tableRow: {
    flexDirection: 'row' as const,
    borderBottomWidth: 0.5,
    borderBottomColor: '#e2e8f0',
    borderBottomStyle: 'solid',
  },
  tableCell: {
    flex: 1,
    padding: 2,
    textAlign: 'center' as const,
    borderRightWidth: 0.5,
    borderRightColor: '#e2e8f0',
    borderRightStyle: 'solid',
    fontSize: 6,
  },
  tableCellLast: {
    flex: 1,
    padding: 2,
    textAlign: 'center' as const,
    fontSize: 6,
  },
  capacityCell: {
    flex: 1,
    padding: 4,
    textAlign: 'center' as const,
    borderRightWidth: 0.5,
    borderRightColor: '#e2e8f0',
    borderRightStyle: 'solid',
    fontSize: 6,
    color: '#dc2626',
    fontWeight: 'bold' as const,
  },
  dimensionCell: {
    flex: 1,
    padding: 4,
    textAlign: 'center' as const,
    borderRightWidth: 0.5,
    borderRightColor: '#e2e8f0',
    borderRightStyle: 'solid',
    fontSize: 6,
    color: '#dc2626',
    fontWeight: 'bold' as const,
  },
  priceCell: {
    flex: 1,
    padding: 4,
    textAlign: 'center' as const,
    borderRightWidth: 0.5,
    borderRightColor: '#e2e8f0',
    borderRightStyle: 'solid',
    fontSize: 6,
    color: '#dc2626',
    fontWeight: 'bold' as const,
  },
  priceCellLast: {
    flex: 1,
    padding: 4,
    textAlign: 'center' as const,
    fontSize: 6,
    color: '#dc2626',
    fontWeight: 'bold' as const,
  },
  headerCell: {
    flex: 1,
    padding: 4,
    textAlign: 'center' as const,
    borderRightWidth: 0.5,
    borderRightColor: '#94a3b8',
    borderRightStyle: 'solid',
    fontSize: 6,
    fontWeight: 'bold' as const,
    color: '#1e3a8a',
  },
  headerCellLast: {
    flex: 1,
    padding: 4,
    textAlign: 'center' as const,
    fontSize: 6,
    fontWeight: 'bold' as const,
    color: '#1e3a8a',
  },
  sectionLabel: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    color: '#dc2626',
    textAlign: 'center' as const,
    alignSelf: 'center' as const,
    paddingLeft: 0,
    paddingRight: 10,
  },
  noProducts: {
    padding: 40,
    textAlign: 'center' as const,
    color: '#94a3b8',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed' as const,
  },
  evenRow: {
    backgroundColor: '#ffffff',
  },
  oddRow: {
    backgroundColor: '#f1f5f9',
  },
  footer: {
    position: 'absolute' as const,
    bottom: 20,
    left: 20,
    right: 20,
    textAlign: 'center' as const,
    fontSize: 8,
    color: '#64748b',
  },
})

export default function PriceListPDF({
  products,
  groupedData,
  bannerUrl,
  isAuthenticated,
}: ProductPricePDFProps) {
  // Calculate max variants for grid layout
  const getMaxVariants = (items: ProductList[]) => {
    if (items.length === 0) return 1
    return Math.max(...items.map((item) => item.variants.length), 1)
  }

  // Render table header
  const renderTableHeader = (isHorizontal: boolean, maxVariants: number) => {
    const cells = []

    cells.push(
      <Text key="capacity" style={styles.headerCell}>
        ចំណុះ
      </Text>,
    )
    cells.push(
      <Text key="diameter" style={styles.headerCell}>
        ទទឹងមាត់
      </Text>,
    )

    if (isHorizontal) {
      cells.push(
        <Text key="length" style={styles.headerCell}>
          បណ្ដោយ
        </Text>,
      )
    }

    cells.push(
      <Text key="height" style={styles.headerCell}>
        កំពស់
      </Text>,
    )

    if (maxVariants > 1) {
      cells.push(
        <Text key="price1" style={styles.headerCell}>
          តម្លៃ (ខៀវ)
        </Text>,
      )
      cells.push(
        <Text key="price2" style={styles.headerCellLast}>
          តម្លៃ (ម៉ាប)
        </Text>,
      )
    } else {
      cells.push(
        <Text key="price" style={styles.headerCellLast}>
          តម្លៃលក់
        </Text>,
      )
    }

    return cells
  }

  // Render table rows
  const renderTableRows = (items: ProductList[], isHorizontal: boolean) => {
    const maxVariants = getMaxVariants(items)

    return items.map((product, idx) => {
      const rowCells = []

      // Capacity
      rowCells.push(
        <Text key="capacity" style={styles.capacityCell}>
          {product.volume || product.name}
        </Text>,
      )

      // Diameter
      rowCells.push(
        <Text key="diameter" style={styles.dimensionCell}>
          {product.diameter || '-'}
        </Text>,
      )

      // Length (horizontal only)
      if (isHorizontal) {
        rowCells.push(
          <Text key="length" style={styles.dimensionCell}>
            {product.length || '-'}
          </Text>,
        )
      }

      // Height
      rowCells.push(
        <Text key="height" style={styles.dimensionCell}>
          {product.height || '-'}
        </Text>,
      )

      // Price columns
      Array.from({ length: maxVariants }).forEach((_, variantIdx) => {
        const variant = product.variants[variantIdx]
        const isLast = variantIdx === maxVariants - 1

        if (isAuthenticated && variant) {
          rowCells.push(
            <Text
              key={`price-${variantIdx}`}
              style={isLast ? styles.priceCellLast : styles.priceCell}
            >
              ${variant.price}
            </Text>,
          )
        } else if (isAuthenticated && !variant) {
          rowCells.push(
            <Text
              key={`empty-${variantIdx}`}
              style={isLast ? styles.priceCellLast : styles.priceCell}
            >
              $0
            </Text>,
          )
        } else {
          rowCells.push(
            <Text
              key={`login-${variantIdx}`}
              style={isLast ? styles.priceCellLast : styles.priceCell}
            >
              សាកសួរ
            </Text>,
          )
        }
      })

      return (
        <View
          key={product.id}
          style={[
            styles.tableRow,
            idx % 2 === 0 ? styles.evenRow : styles.oddRow,
          ]}
        >
          {rowCells}
        </View>
      )
    })
  }

  // Render a price table section
  const renderPriceTable = (
    items: ProductList[],
    title: string,
    isHorizontal: boolean,
  ) => {
    if (items.length === 0) return null

    const maxVariants = getMaxVariants(items)

    return (
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>

        {/* Table Header */}
        <View style={styles.tableHeader}>
          {renderTableHeader(isHorizontal, maxVariants)}
        </View>

        {/* Table Body */}
        <View>{renderTableRows(items, isHorizontal)}</View>
      </View>
    )
  }

  // Render section with label
  const renderSection = (type: string, isOther = false) => {
    const group = groupedData[type]
    if (!group) return null

    const hasData = group.vertical.length > 0 || group.horizontal.length > 0
    if (!hasData) return null

    return (
      <View
        key={type}
        style={{
          display: 'flex',
          flexDirection: 'row',
          width: '100%',
          gap: 5,
          justifyContent: 'center',
        }}
      >
        {/* Vertical Table */}
        {renderPriceTable(group.vertical, 'ធុងឈរ (Vertical Tanks)', false)}

        {/* Section Label */}
        {!isOther && <Text style={styles.sectionLabel}>{type}</Text>}

        {/* Horizontal Table */}
        {renderPriceTable(
          group.horizontal,
          'ធុងទឹកផ្តេក (Horizontal Tanks)',
          true,
        )}
      </View>
    )
  }

  return (
    <Document creator="limheng">
      <Page size="A4" style={styles.page} wrap>
        {/* Banner Image */}
        {bannerUrl && <Image src={bannerUrl} style={styles.banner} />}

        {/* Content */}
        {products.length === 0 ? (
          <View style={styles.noProducts}>
            <Text>No products found.</Text>
          </View>
        ) : (
          <View>
            {/* Render all groups dynamically in sorted order */}
            {Object.entries(groupedData)
              .sort(([a], [b]) => {
                // Sort: A, B, C first, then other letters alphabetically, OTHER last
                if (a === 'OTHER') return 1
                if (b === 'OTHER') return -1
                return a.localeCompare(b)
              })
              .map(([key], index, array) => {
                const isOther = key === 'OTHER'
                // Add page break before each section except the first
                const shouldAddBreak = index > 0
                return (
                  <React.Fragment key={key}>
                    {shouldAddBreak && <View break />}
                    {renderSection(key, isOther)}
                  </React.Fragment>
                )
              })}
          </View>
        )}
      </Page>
    </Document>
  )
}
