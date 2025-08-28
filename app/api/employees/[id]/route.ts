import { NextResponse } from "next/server";
import { updateEmployee } from "@/lib/database";
import { updateEmployeeSchema } from "@/lib/schemas";
import { z } from "zod";

export async function PUT(request: Request, context: any) {
  try {
    const { id } = context.params;
    const employeeData = await request.json();

    const validatedData = updateEmployeeSchema.parse(employeeData);

    await updateEmployee(id, validatedData);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Error updating employee:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}