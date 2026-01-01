import { NextRequest, NextResponse } from "next/server";

// Mock ESG metrics data
const mockMetrics = [
  {
    id: "1",
    name: "Carbon Emissions",
    category: "environmental",
    description: "Total CO2 equivalent emissions from operations",
    currentValue: 850,
    targetValue: 750,
    unit: "tonnes CO2e",
    status: "at_risk",
    trend: "down",
    lastUpdated: "2024-12-15",
    dataSource: "Environmental Management System",
    verified: true,
  },
  {
    id: "2",
    name: "Employee Diversity",
    category: "social",
    description: "Percentage of diverse employees in leadership roles",
    currentValue: 35,
    targetValue: 40,
    unit: "%",
    status: "on_track",
    trend: "up",
    lastUpdated: "2024-12-10",
    dataSource: "HR Records",
    verified: true,
  },
  {
    id: "3",
    name: "Board Independence",
    category: "governance",
    description: "Percentage of independent board members",
    currentValue: 60,
    targetValue: 50,
    unit: "%",
    status: "achieved",
    trend: "stable",
    lastUpdated: "2024-12-01",
    dataSource: "Board Records",
    verified: true,
  },
];

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");

    let filteredMetrics = mockMetrics;

    if (category && category !== "all") {
      filteredMetrics = filteredMetrics.filter(
        (metric) => metric.category === category
      );
    }

    if (status && status !== "all") {
      filteredMetrics = filteredMetrics.filter(
        (metric) => metric.status === status
      );
    }

    return NextResponse.json({
      success: true,
      data: filteredMetrics,
      total: filteredMetrics.length,
    });
  } catch (error) {
    console.error("Error fetching ESG metrics:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch ESG metrics" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const requiredFields = [
      "name",
      "category",
      "description",
      "currentValue",
      "targetValue",
      "unit",
      "dataSource",
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create new metric
    const newMetric = {
      id: Date.now().toString(),
      name: body.name,
      category: body.category,
      description: body.description,
      currentValue: parseFloat(body.currentValue),
      targetValue: parseFloat(body.targetValue),
      unit: body.unit,
      status: body.currentValue >= body.targetValue ? "achieved" : "on_track",
      trend: "stable",
      lastUpdated: new Date().toISOString().split("T")[0],
      dataSource: body.dataSource,
      verified: body.verified || false,
    };

    // In a real app, save to database
    mockMetrics.push(newMetric);

    return NextResponse.json({
      success: true,
      data: newMetric,
      message: "ESG metric created successfully",
    });
  } catch (error) {
    console.error("Error creating ESG metric:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create ESG metric" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Metric ID is required" },
        { status: 400 }
      );
    }

    // Find and update metric
    const metricIndex = mockMetrics.findIndex((metric) => metric.id === id);

    if (metricIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Metric not found" },
        { status: 404 }
      );
    }

    // Update metric
    mockMetrics[metricIndex] = {
      ...mockMetrics[metricIndex],
      ...updateData,
      lastUpdated: new Date().toISOString().split("T")[0],
    };

    return NextResponse.json({
      success: true,
      data: mockMetrics[metricIndex],
      message: "ESG metric updated successfully",
    });
  } catch (error) {
    console.error("Error updating ESG metric:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update ESG metric" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Metric ID is required" },
        { status: 400 }
      );
    }

    // Find and remove metric
    const metricIndex = mockMetrics.findIndex((metric) => metric.id === id);

    if (metricIndex === -1) {
      return NextResponse.json(
        { success: false, error: "Metric not found" },
        { status: 404 }
      );
    }

    mockMetrics.splice(metricIndex, 1);

    return NextResponse.json({
      success: true,
      message: "ESG metric deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting ESG metric:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete ESG metric" },
      { status: 500 }
    );
  }
}
