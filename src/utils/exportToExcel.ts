import * as XLSX from "xlsx";

type BusinessModelCanvas = {
    key_partners: string[];
    key_activities: string[];
    value_proposition: string[];
    customer_relationships: string[];
    customer_segments: string[];
    key_resources: string[];
    channels: string[];
    cost_structure: string[];
    revenue_streams: string[];
};

export function exportCanvasToExcel(canvas: BusinessModelCanvas, startupName: string) {
    // We want to create a clean, vertical 2-column list:
    // | Category            | Item                          |
    // |---------------------|-------------------------------|
    // | Key Partners        | - Partner A                   |
    // |                     | - Partner B                   |
    // | Key Activities      | - Activity A                  |

    const rawData: any[][] = [
        ["Category", "Details"] // Header
    ];

    const categories = [
        { key: "key_partners", label: "Key Partners" },
        { key: "key_activities", label: "Key Activities" },
        { key: "key_resources", label: "Key Resources" },
        { key: "value_proposition", label: "Value Proposition" },
        { key: "customer_relationships", label: "Customer Relationships" },
        { key: "channels", label: "Channels" },
        { key: "customer_segments", label: "Customer Segments" },
        { key: "cost_structure", label: "Cost Structure" },
        { key: "revenue_streams", label: "Revenue Streams" },
    ];

    categories.forEach((cat) => {
        const items = canvas[cat.key as keyof BusinessModelCanvas] || [];

        if (items.length === 0) {
            rawData.push([cat.label, "None specified"]);
        } else {
            // First item is parallel to the category name
            rawData.push([cat.label, items[0]]);

            // Subsequent items get an empty string for the category column
            for (let i = 1; i < items.length; i++) {
                rawData.push(["", items[i]]);
            }
        }
        // Add a blank row for spacing between categories
        rawData.push(["", ""]);
    });

    const ws = XLSX.utils.aoa_to_sheet(rawData);

    // Auto-size columns slightly for better readability
    const colWidths = [
        { wch: 25 }, // Category column width
        { wch: 80 }  // Details column width
    ];
    ws["!cols"] = colWidths;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Business Model Canvas");

    const safeFilename = startupName.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'startup';
    XLSX.writeFile(wb, `${safeFilename}_business_model_canvas.xlsx`);
}
