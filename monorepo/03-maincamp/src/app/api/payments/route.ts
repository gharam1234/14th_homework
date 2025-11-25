import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

/**
 * POST /api/payments
 * PortOne v2 빌링키 결제 API
 * 
 * 요청 데이터:
 * - billingKey: string (PortOne 빌링키)
 * - orderName: string (주문명)
 * - amount: number (결제 금액)
 * - customer: { id: string } (고객 정보)
 * 
 * 응답 데이터:
 * - success: boolean (결제 성공 여부)
 */
export async function POST(request: NextRequest) {
  try {
    // 1. 요청 데이터 파싱
    const body = await request.json();
    const { billingKey, orderName, amount, customer } = body;

    // 1-1. 필수 파라미터 검증
    if (!billingKey || !orderName || !amount || !customer?.id) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // 1-2. 환경 변수 검증
    const portoneApiSecret = process.env.PORTONE_API_SECRET;
    if (!portoneApiSecret) {
      return NextResponse.json(
        { success: false, error: 'PORTONE_API_SECRET not configured' },
        { status: 500 }
      );
    }

    // 2. 결제 ID 생성 (UUID)
    const paymentId = uuidv4();

    // 3. PortOne API 호출 - 빌링키로 결제 요청
    const portoneEndpoint = `https://api.portone.io/payments/${encodeURIComponent(paymentId)}/billing-key`;
    
    const portoneResponse = await fetch(portoneEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `PortOne ${portoneApiSecret}`,
      },
      body: JSON.stringify({
        billingKey,
        orderName,
        amount: {
          total: amount,
        },
        customer: {
          id: customer.id,
        },
        currency: 'KRW',
      }),
    });

    // 4. PortOne API 응답 처리
    if (!portoneResponse.ok) {
      const errorData = await portoneResponse.json().catch(() => ({}));
      console.error('PortOne API Error:', errorData);
      return NextResponse.json(
        { success: false, error: 'Payment failed', details: errorData },
        { status: portoneResponse.status }
      );
    }

    const paymentData = await portoneResponse.json();
    console.log('Payment successful:', paymentData);

    // 5. 성공 응답 반환 (DB 저장 없음)
    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Payment API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
