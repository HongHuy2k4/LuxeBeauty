import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "react-i18next";
import { fetchOrders, cancelOrder, type Order } from "@/lib/api";

const OrdersPage = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [isCancelling, setIsCancelling] = useState<number | null>(null);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await fetchOrders();
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast({
        title: t("common.error") || "Lỗi",
        description: t("orders.loadFailed") || "Không thể tải danh sách đơn hàng",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate("/dang-nhap");
      } else {
        loadOrders();
      }
    }
  }, [isAuthenticated, authLoading, navigate]);

  const handleCancelOrder = async (orderId: number) => {
    if (!window.confirm(t("orders.confirmCancelDesc") || "Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.")) {
      return;
    }

    setIsCancelling(orderId);
    try {
      await cancelOrder(orderId);
      toast({
        title: t("orders.cancelSuccess") || "Đã hủy đơn hàng",
        description: t("orders.cancelSuccessDesc") || "Đơn hàng đã được hủy thành công",
      });
      // Refresh orders
      await loadOrders();
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      const errorMessage = error?.response?.data?.message || t("orders.cancelError") || "Có lỗi xảy ra khi hủy đơn hàng";
      toast({
        title: t("common.error") || "Lỗi",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsCancelling(null);
    }
  };

  const toggleExpandOrder = (orderId: number) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusBadge = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 gap-1">
            <Clock className="w-3.5 h-3.5" />
            {t("orders.statusPending") || "Chờ xác nhận"}
          </Badge>
        );
      case "processing":
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 gap-1">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            {t("orders.statusProcessing") || "Đang xử lý"}
          </Badge>
        );
      case "shipped":
        return (
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 gap-1">
            <Truck className="w-3.5 h-3.5" />
            {t("orders.statusShipping") || "Đang giao"}
          </Badge>
        );
      case "delivered":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            {t("orders.statusDelivered") || "Đã giao"}
          </Badge>
        );
      case "cancelled":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 gap-1">
            <XCircle className="w-3.5 h-3.5" />
            {t("orders.statusCancelled") || "Đã hủy"}
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Filter orders by active tab
  const filteredOrders = orders.filter((order) => {
    if (activeTab === "all") return true;
    return order.status === activeTab;
  });

  const tabs = [
    { id: "all", label: t("orders.statusAll") || "Tất cả" },
    { id: "pending", label: t("orders.statusPending") || "Chờ xác nhận" },
    { id: "processing", label: t("orders.statusProcessing") || "Đang xử lý" },
    { id: "shipped", label: t("orders.statusShipping") || "Đang giao" },
    { id: "delivered", label: t("orders.statusDelivered") || "Đã giao" },
    { id: "cancelled", label: t("orders.statusCancelled") || "Đã hủy" },
  ];

  if (authLoading || (isLoading && orders.length === 0)) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-24">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-12 w-64" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-48 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Helmet>
        <title>{t("orders.title") || "Đơn hàng của tôi"} - LuxeBeauty</title>
      </Helmet>

      <Header />

      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-6">
            <Button
              variant="ghost"
              size="sm"
              className="pl-0 hover:pl-2 transition-all"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t("common.backToHome") || "Về trang chủ"}
            </Button>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-serif font-bold tracking-tight mb-2">
              {t("orders.myOrders") || "Đơn hàng của tôi"}
            </h1>
            <p className="text-muted-foreground">
              {t("orders.trackYourOrders") || "Theo dõi và quản lý đơn hàng của bạn"}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border overflow-x-auto pb-px mb-8 scrollbar-none gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setExpandedOrderId(null);
                }}
                className={`py-3 px-4 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent className="flex flex-col items-center justify-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Package className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">
                  {t("orders.noOrders") || "Chưa có đơn hàng"}
                </h3>
                <p className="text-muted-foreground max-w-sm">
                  {activeTab === "all"
                    ? t("orders.noOrdersMessage") || "Bạn chưa thực hiện bất kỳ đơn hàng nào."
                    : t("orders.noOrdersStatus") || "Không có đơn hàng nào ở trạng thái này."}
                </p>
                <Button asChild className="mt-4">
                  <Link to="/san-pham">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    {t("common.exploreProducts") || "Khám phá sản phẩm"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const isExpanded = expandedOrderId === order.id;
                return (
                  <Card key={order.id} className="overflow-hidden transition-all duration-200 border-border/50 shadow-soft hover:border-primary/20">
                    <CardHeader className="bg-secondary/10 pb-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                            {t("orders.orderNumber") || "Mã đơn hàng"}
                          </p>
                          <p className="font-mono font-medium text-sm text-foreground">
                            #{order.orderNumber}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                            {t("orders.orderDate") || "Ngày đặt"}
                          </p>
                          <p className="text-sm text-foreground">
                            {formatDate(order.createdAt)}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                            {t("orders.orderTotal") || "Tổng tiền"}
                          </p>
                          <p className="text-sm font-semibold text-primary">
                            {formatPrice(order.total)}
                          </p>
                        </div>
                        <div>
                          {getStatusBadge(order.status)}
                        </div>
                      </div>
                    </CardHeader>

                    {/* Basic Order Items view */}
                    <CardContent className="pt-6">
                      <div className="space-y-4">
                        {order.items?.slice(0, isExpanded ? undefined : 1).map((item) => (
                          <div key={item.id} className="flex gap-4">
                            <div className="h-16 w-16 rounded-md bg-muted overflow-hidden flex-shrink-0 border border-border/50">
                              {item.productImage ? (
                                <img
                                  src={item.productImage}
                                  alt={item.productName}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center bg-muted-foreground/10">
                                  <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 space-y-1">
                              <h4 className="font-medium text-sm line-clamp-2">
                                {item.productName}
                              </h4>
                              <p className="text-xs text-muted-foreground">
                                {t("common.quantity") || "Số lượng"}: {item.quantity}
                              </p>
                            </div>
                            <p className="text-sm font-medium text-right">
                              {formatPrice(item.productPrice)}
                            </p>
                          </div>
                        ))}

                        {/* Show count of other items if not expanded */}
                        {!isExpanded && order.items && order.items.length > 1 && (
                          <button
                            onClick={() => toggleExpandOrder(order.id)}
                            className="text-xs text-primary font-medium hover:underline flex items-center"
                          >
                            Xem thêm {order.items.length - 1} sản phẩm khác
                          </button>
                        )}
                      </div>

                      {/* Expanded Section Details */}
                      {isExpanded && (
                        <div className="mt-6 pt-6 border-t border-border space-y-6">
                          {/* Price Breakdown */}
                          <div className="max-w-xs ml-auto space-y-2 text-sm">
                            <div className="flex justify-between text-muted-foreground">
                              <span>{t("common.subtotal") || "Tạm tính"}</span>
                              <span>{formatPrice(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-muted-foreground">
                              <span>{t("orders.shippingFee") || "Phí vận chuyển"}</span>
                              <span>{formatPrice(order.shippingFee)}</span>
                            </div>
                            {order.total - order.subtotal - order.shippingFee < 0 && (
                              <div className="flex justify-between text-green-600">
                                <span>{t("common.discount") || "Giảm giá"}</span>
                                <span>{formatPrice(Math.abs(order.total - order.subtotal - order.shippingFee))}</span>
                              </div>
                            )}
                            <Separator />
                            <div className="flex justify-between font-semibold text-base text-foreground">
                              <span>{t("common.total") || "Tổng cộng"}</span>
                              <span>{formatPrice(order.total)}</span>
                            </div>
                          </div>

                          <Separator />

                          {/* Shipping and Payment info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                            <div className="space-y-3">
                              <h5 className="font-semibold text-foreground flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                {t("orderDetail.shippingInfo") || "Thông tin giao hàng"}
                              </h5>
                              <div className="space-y-1 text-muted-foreground">
                                <p className="flex items-center gap-2 text-foreground font-medium">
                                  <User className="w-3.5 h-3.5" />
                                  {order.shippingName}
                                </p>
                                <p className="flex items-center gap-2">
                                  <Phone className="w-3.5 h-3.5" />
                                  {order.shippingPhone}
                                </p>
                                {order.shippingEmail && (
                                  <p className="flex items-center gap-2">
                                    <Mail className="w-3.5 h-3.5" />
                                    {order.shippingEmail}
                                  </p>
                                )}
                                <p className="pt-1 flex items-start gap-2">
                                  <span className="mt-0.5">•</span>
                                  <span>{order.shippingAddress}</span>
                                </p>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <h5 className="font-semibold text-foreground flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-primary" />
                                {t("orderDetail.payment") || "Thanh toán"}
                              </h5>
                              <div className="space-y-1 text-muted-foreground">
                                <p>
                                  {t("adminOrderDetail.paymentLabel") || "Phương thức"}:{" "}
                                  <span className="text-foreground font-medium">
                                    {order.paymentMethod === "cod"
                                      ? t("checkout.paymentCOD") || "Thanh toán khi nhận hàng (COD)"
                                      : order.paymentMethod === "bank_transfer"
                                      ? t("checkout.paymentBank") || "Chuyển khoản ngân hàng"
                                      : order.paymentMethod || "Chưa xác định"}
                                  </span>
                                </p>
                                <p>
                                  {t("common.status") || "Trạng thái"}:{" "}
                                  <Badge
                                    variant="outline"
                                    className={`ml-1 text-xs py-0 ${
                                      order.paymentStatus === "paid"
                                        ? "bg-green-50 text-green-700 border-green-200"
                                        : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                    }`}
                                  >
                                    {order.paymentStatus === "paid"
                                      ? t("orderDetail.paid") || "Đã thanh toán"
                                      : t("orderDetail.unpaid") || "Chưa thanh toán"}
                                  </Badge>
                                </p>
                                {order.notes && (
                                  <p className="pt-2 text-xs italic">
                                    {t("adminOrderDetail.notes") || "Ghi chú"}: "{order.notes}"
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="border-t border-border/50 py-3 px-6 flex justify-between bg-secondary/5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpandOrder(order.id)}
                        className="text-xs text-muted-foreground hover:text-foreground gap-1"
                      >
                        {isExpanded ? (
                          <>
                            <ChevronUp className="w-4 h-4" />
                            {t("common.showLess") || "Thu gọn"}
                          </>
                        ) : (
                          <>
                            <ChevronDown className="w-4 h-4" />
                            {t("common.viewDetails") || "Xem chi tiết"}
                          </>
                        )}
                      </Button>

                      {/* Cancel Order Action */}
                      {order.status === "pending" && (
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={isCancelling === order.id}
                          onClick={() => handleCancelOrder(order.id)}
                          className="h-8 text-xs"
                        >
                          {isCancelling === order.id ? (
                            <>
                              <span className="animate-spin mr-1">⟳</span>
                              Đang hủy...
                            </>
                          ) : (
                            t("orders.cancelOrder") || "Hủy đơn"
                          )}
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrdersPage;
