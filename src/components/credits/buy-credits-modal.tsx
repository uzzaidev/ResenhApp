"use client";

import * as React from "react";
import { Sparkles, Check, Tag, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

/**
 * Buy Credits Modal
 * 
 * Modal para compra de créditos com suporte a cupons promocionais.
 * 
 * Features:
 * - Seleção de pacotes
 * - Validação de cupons
 * - Desconto percentual
 * - Desconto fixo em reais
 * - Bônus de créditos
 * - Cálculo de preço final
 * 
 * @example
 * <BuyCreditsModal
 *   open={showModal}
 *   onOpenChange={setShowModal}
 *   groupId="123"
 *   packages={packages}
 *   onPurchaseSuccess={() => refetch()}
 * />
 */

export interface CreditPackage {
  id: string;
  name: string;
  creditsAmount: number;
  priceCents: number;
  isActive: boolean;
}

export interface CouponValidation {
  isValid: boolean;
  couponId?: string;
  discountType?: "percentage" | "fixed_credits" | "fixed_amount";
  discountValue?: number;
  discountApplied?: number;
  finalPriceCents?: number;
  bonusCredits?: number;
  errorMessage?: string;
}

export interface BuyCreditsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupId: string;
  packages: CreditPackage[];
  onPurchaseSuccess?: () => void;
}

export function BuyCreditsModal({
  open,
  onOpenChange,
  groupId,
  packages,
  onPurchaseSuccess,
}: BuyCreditsModalProps) {
  const [selectedPackageId, setSelectedPackageId] = React.useState<string>("");
  const [couponCode, setCouponCode] = React.useState("");
  const [couponValidation, setCouponValidation] = React.useState<CouponValidation | null>(null);
  const [isValidatingCoupon, setIsValidatingCoupon] = React.useState(false);
  const [isPurchasing, setIsPurchasing] = React.useState(false);

  const selectedPackage = packages.find((p) => p.id === selectedPackageId);

  // Reset coupon when package changes
  React.useEffect(() => {
    setCouponCode("");
    setCouponValidation(null);
  }, [selectedPackageId]);

  // Validate coupon
  const handleValidateCoupon = async () => {
    if (!couponCode.trim() || !selectedPackage) return;

    setIsValidatingCoupon(true);

    try {
      const response = await fetch("/api/credits/validate-coupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          code: couponCode.trim().toUpperCase(),
          packagePriceCents: selectedPackage.priceCents,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Erro",
          description: data.error || "Erro ao validar cupom",
          variant: "destructive",
        });
        setCouponValidation(null);
        return;
      }

      setCouponValidation(data);

      if (!data.isValid) {
        toast({
          title: "Cupom inválido",
          description: data.errorMessage || "Este cupom não pode ser utilizado",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Cupom aplicado!",
          description: getDiscountDescription(data),
        });
      }
    } catch (error) {
      console.error("Error validating coupon:", error);
      toast({
        title: "Erro",
        description: "Erro ao validar cupom",
        variant: "destructive",
      });
      setCouponValidation(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  // Remove coupon
  const handleRemoveCoupon = () => {
    setCouponCode("");
    setCouponValidation(null);
  };

  // Purchase credits
  const handlePurchase = async () => {
    if (!selectedPackageId) {
      toast({
        title: "Erro",
        description: "Selecione um pacote",
        variant: "destructive",
      });
      return;
    }

    setIsPurchasing(true);

    try {
      const response = await fetch("/api/credits/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          packageId: selectedPackageId,
          couponCode: couponValidation?.isValid ? couponCode.trim().toUpperCase() : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Erro",
          description: data.error || "Erro ao comprar créditos",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: "Compra realizada!",
        description: `${data.creditsAdded} créditos adicionados${
          data.bonusCredits > 0 ? ` + ${data.bonusCredits} bônus` : ""
        }`,
      });

      onOpenChange(false);
      onPurchaseSuccess?.();
    } catch (error) {
      console.error("Error purchasing credits:", error);
      toast({
        title: "Erro",
        description: "Erro ao comprar créditos",
        variant: "destructive",
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  // Get discount description
  const getDiscountDescription = (validation: CouponValidation): string => {
    if (!validation.isValid) return "";

    if (validation.discountType === "percentage") {
      return `${validation.discountValue}% de desconto aplicado`;
    } else if (validation.discountType === "fixed_amount") {
      const discount = (validation.discountApplied || 0) / 100;
      return `R$ ${discount.toFixed(2)} de desconto aplicado`;
    } else if (validation.discountType === "fixed_credits") {
      return `+${validation.bonusCredits} créditos bônus`;
    }

    return "Desconto aplicado";
  };

  // Calculate final values
  const finalPrice = couponValidation?.isValid
    ? (couponValidation.finalPriceCents || selectedPackage?.priceCents || 0) / 100
    : (selectedPackage?.priceCents || 0) / 100;

  const originalPrice = (selectedPackage?.priceCents || 0) / 100;
  const totalCredits =
    (selectedPackage?.creditsAmount || 0) + (couponValidation?.bonusCredits || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-uzzai-gold" />
            Comprar Créditos
          </DialogTitle>
          <DialogDescription>
            Escolha um pacote e adicione um cupom promocional (opcional)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Packages */}
          <div>
            <Label className="mb-3 block">Selecione um pacote</Label>
            <div className="grid gap-3 md:grid-cols-2">
              {packages.map((pkg) => {
                const isSelected = selectedPackageId === pkg.id;
                const pricePerCredit = pkg.priceCents / pkg.creditsAmount / 100;

                return (
                  <button
                    key={pkg.id}
                    onClick={() => setSelectedPackageId(pkg.id)}
                    className={cn(
                      "relative rounded-lg border-2 p-4 text-left transition-all hover:border-uzzai-mint/50",
                      isSelected
                        ? "border-uzzai-mint bg-uzzai-mint/5"
                        : "border-border bg-card"
                    )}
                  >
                    {isSelected && (
                      <div className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-uzzai-mint">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}

                    <div className="mb-2 flex items-center justify-between">
                      <h4 className="font-semibold font-poppins">{pkg.name}</h4>
                      <Badge variant="secondary" className="bg-uzzai-gold/20 text-uzzai-gold">
                        {pkg.creditsAmount} créditos
                      </Badge>
                    </div>

                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-uzzai-mint">
                        R$ {(pkg.priceCents / 100).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        R$ {pricePerCredit.toFixed(2)} por crédito
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Coupon */}
          {selectedPackage && (
            <div>
              <Label htmlFor="coupon" className="mb-2 block">
                Cupom Promocional (opcional)
              </Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="coupon"
                    placeholder="Digite o código do cupom"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={isValidatingCoupon || couponValidation?.isValid}
                    className="pl-10"
                  />
                  {couponValidation?.isValid && (
                    <button
                      onClick={handleRemoveCoupon}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleValidateCoupon}
                  disabled={
                    !couponCode.trim() ||
                    isValidatingCoupon ||
                    couponValidation?.isValid
                  }
                >
                  {isValidatingCoupon ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Aplicar"
                  )}
                </Button>
              </div>

              {/* Coupon validation message */}
              {couponValidation?.isValid && (
                <div className="mt-2 flex items-center gap-2 rounded-md bg-green-50 p-2 text-sm text-green-700">
                  <Check className="h-4 w-4" />
                  <span>{getDiscountDescription(couponValidation)}</span>
                </div>
              )}
            </div>
          )}

          {/* Summary */}
          {selectedPackage && (
            <div className="rounded-lg border bg-card p-4 space-y-2">
              <h4 className="font-semibold mb-3">Resumo da Compra</h4>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Créditos do pacote</span>
                <span className="font-medium">{selectedPackage.creditsAmount}</span>
              </div>

              {couponValidation?.bonusCredits && couponValidation.bonusCredits > 0 && (
                <div className="flex justify-between text-sm text-uzzai-gold">
                  <span>Bônus do cupom</span>
                  <span className="font-medium">+{couponValidation.bonusCredits}</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-semibold border-t pt-2">
                <span>Total de créditos</span>
                <span className="text-uzzai-mint">{totalCredits}</span>
              </div>

              <div className="border-t pt-2 mt-2">
                {couponValidation?.isValid && originalPrice !== finalPrice && (
                  <div className="flex justify-between text-sm text-muted-foreground line-through">
                    <span>Preço original</span>
                    <span>R$ {originalPrice.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold">
                  <span>Total a pagar</span>
                  <span className="text-uzzai-mint">R$ {finalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isPurchasing}
          >
            Cancelar
          </Button>
          <Button
            onClick={handlePurchase}
            disabled={!selectedPackageId || isPurchasing}
            className="bg-uzzai-mint hover:bg-uzzai-mint/90 text-uzzai-black"
          >
            {isPurchasing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Comprar Agora
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


