
import { useAppContext } from '../../index'
import '../../styles/input-screens.css'

const AVAILABLE_GUIDES = [
  {
    id: 'retirement-planning',
    title: 'Retirement Planning',
    description: 'Strategies for maximizing retirement contributions and tax benefits'
  },
  {
    id: 'tax-optimization',
    title: 'Tax Optimization',
    description: 'Techniques to legally minimize your tax liability'
  },
  {
    id: 'estimated-payments',
    title: 'Estimated Tax Payments',
    description: 'When and how to make quarterly estimated tax payments'
  },
  {
    id: 'deductions',
    title: 'Itemized Deductions',
    description: 'Understand itemized vs. standard deductions'
  },
  {
    id: 'business-expenses',
    title: 'Business Expenses',
    description: 'What qualifies as a deductible business expense'
  },
  {
    id: 'capital-loss-carryover',
    title: 'Capital Loss Carryover',
    description: 'How to use capital losses to offset future gains'
  }
]

export default function Guides() {
  const { taxData, updateTaxData } = useAppContext()
  const guides = taxData.guides || { selectedGuides: [] }

  const handleToggleGuide = (guideId: string) => {
    const selected = guides.selectedGuides || []
    const isSelected = selected.includes(guideId)
    const newSelected = isSelected
      ? selected.filter((id) => id !== guideId)
      : [...selected, guideId]

    updateTaxData('guides', {
      selectedGuides: newSelected
    })
  }

  return (
    <div className="screen">
      <div className="screen-header">
        <h1>Tax Guides</h1>
        <p>Select guides that are relevant to your situation</p>
      </div>

      <div className="form-section">
        <h2>Available Resources</h2>
        <div className="guides-list">
          {AVAILABLE_GUIDES.map((guide) => (
            <label key={guide.id} className="guide-item">
              <input
                type="checkbox"
                checked={(guides.selectedGuides || []).includes(guide.id)}
                onChange={() => handleToggleGuide(guide.id)}
              />
              <div className="guide-item-content">
                <p className="guide-item-title">{guide.title}</p>
                <p className="guide-item-desc">{guide.description}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="info-box">
        <strong>Selected Guides: </strong>
        {guides.selectedGuides?.length || 0} of {AVAILABLE_GUIDES.length}
      </div>
    </div>
  )
}
