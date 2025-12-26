"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layout";
import { ProtectedRoute } from "@/components/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";
import { Alert, AlertDescription } from "@/components/ui/Alert";
import { Plus, ShoppingCart, DollarSign, AlertTriangle } from "lucide-react";
import type { LoanListing, LoanOffer } from "@/types/api";

export default function SecondaryMarketPage() {
  const [listings, setListings] = useState<LoanListing[]>([]);
  const [offers, setOffers] = useState<LoanOffer[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("listings");

  // Form states
  const [showCreateListing, setShowCreateListing] = useState(false);
  const [showCreateOffer, setShowCreateOffer] = useState(false);
  const [listingForm, setListingForm] = useState({
    listingId: "",
    seller: "",
    loanId: "",
    askingPrice: "",
    originalAmount: "",
    outstandingAmount: "",
    interestRate: "",
    maturityDate: "",
    borrower: "",
  });
  const [offerForm, setOfferForm] = useState({
    offerId: "",
    buyer: "",
    listingId: "",
    offerPrice: "",
    terms: "",
    validUntil: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setError(null);

    try {
      const [listingsRes, offersRes] = await Promise.all([
        secondaryMarketApi.getLoanListings(),
        secondaryMarketApi.getLoanOffers(),
      ]);

      if (listingsRes.error) throw new Error(listingsRes.error);
      if (offersRes.error) throw new Error(offersRes.error);

      setListings(listingsRes.data || []);
      setOffers(offersRes.data || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load secondary market data"
      );
    }
  };

  const handleCreateListing = async () => {
    try {
      const response = await secondaryMarketApi.createLoanListing({
        listingId: listingForm.listingId,
        seller: listingForm.seller,
        loanId: listingForm.loanId,
        askingPrice: listingForm.askingPrice,
        loanDetails: {
          originalAmount: listingForm.originalAmount,
          outstandingAmount: listingForm.outstandingAmount,
          interestRate: listingForm.interestRate,
          maturityDate: listingForm.maturityDate,
          borrower: listingForm.borrower,
        },
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setShowCreateListing(false);
      setListingForm({
        listingId: "",
        seller: "",
        loanId: "",
        askingPrice: "",
        originalAmount: "",
        outstandingAmount: "",
        interestRate: "",
        maturityDate: "",
        borrower: "",
      });
      loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create loan listing"
      );
    }
  };

  const handleCreateOffer = async () => {
    try {
      const response = await secondaryMarketApi.createLoanOffer({
        ...offerForm,
        validUntil: new Date(offerForm.validUntil).toISOString(),
      });

      if (response.error) {
        throw new Error(response.error);
      }

      setShowCreateOffer(false);
      setOfferForm({
        offerId: "",
        buyer: "",
        listingId: "",
        offerPrice: "",
        terms: "",
        validUntil: "",
      });
      loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create loan offer"
      );
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-blue-100 text-blue-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "expired":
        return "bg-gray-100 text-gray-800";
      case "sold":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const calculateYield = (
    interestRate: string,
    askingPrice: string,
    outstandingAmount: string
  ) => {
    const rate = parseFloat(interestRate);
    const price = parseFloat(askingPrice);
    const outstanding = parseFloat(outstandingAmount);

    if (price === 0) return "0.00";

    const effectiveYield = (rate * outstanding) / price;
    return effectiveYield.toFixed(2);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Secondary Market
              </h1>
              <p className="text-muted-foreground">
                Trade loan positions, create listings, and make offers
              </p>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="listings">Loan Listings</TabsTrigger>
              <TabsTrigger value="offers">Offers</TabsTrigger>
            </TabsList>

            <TabsContent value="listings" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Loan Listings</h2>
                <Button onClick={() => setShowCreateListing(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Listing
                </Button>
              </div>

              {showCreateListing && (
                <Card>
                  <CardHeader>
                    <CardTitle>Create Loan Listing</CardTitle>
                    <CardDescription>
                      List a loan position for sale on the secondary market
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="listingId">Listing ID</Label>
                        <Input
                          id="listingId"
                          value={listingForm.listingId}
                          onChange={(e) =>
                            setListingForm({
                              ...listingForm,
                              listingId: e.target.value,
                            })
                          }
                          placeholder="Enter listing ID"
                        />
                      </div>
                      <div>
                        <Label htmlFor="seller">Seller</Label>
                        <Input
                          id="seller"
                          value={listingForm.seller}
                          onChange={(e) =>
                            setListingForm({
                              ...listingForm,
                              seller: e.target.value,
                            })
                          }
                          placeholder="Enter seller party"
                        />
                      </div>
                      <div>
                        <Label htmlFor="loanId">Loan ID</Label>
                        <Input
                          id="loanId"
                          value={listingForm.loanId}
                          onChange={(e) =>
                            setListingForm({
                              ...listingForm,
                              loanId: e.target.value,
                            })
                          }
                          placeholder="Enter loan ID"
                        />
                      </div>
                      <div>
                        <Label htmlFor="askingPrice">Asking Price</Label>
                        <Input
                          id="askingPrice"
                          value={listingForm.askingPrice}
                          onChange={(e) =>
                            setListingForm({
                              ...listingForm,
                              askingPrice: e.target.value,
                            })
                          }
                          placeholder="Enter asking price"
                        />
                      </div>
                      <div>
                        <Label htmlFor="originalAmount">Original Amount</Label>
                        <Input
                          id="originalAmount"
                          value={listingForm.originalAmount}
                          onChange={(e) =>
                            setListingForm({
                              ...listingForm,
                              originalAmount: e.target.value,
                            })
                          }
                          placeholder="Enter original loan amount"
                        />
                      </div>
                      <div>
                        <Label htmlFor="outstandingAmount">
                          Outstanding Amount
                        </Label>
                        <Input
                          id="outstandingAmount"
                          value={listingForm.outstandingAmount}
                          onChange={(e) =>
                            setListingForm({
                              ...listingForm,
                              outstandingAmount: e.target.value,
                            })
                          }
                          placeholder="Enter outstanding amount"
                        />
                      </div>
                      <div>
                        <Label htmlFor="interestRate">Interest Rate (%)</Label>
                        <Input
                          id="interestRate"
                          type="number"
                          step="0.01"
                          value={listingForm.interestRate}
                          onChange={(e) =>
                            setListingForm({
                              ...listingForm,
                              interestRate: e.target.value,
                            })
                          }
                          placeholder="e.g., 5.25"
                        />
                      </div>
                      <div>
                        <Label htmlFor="maturityDate">Maturity Date</Label>
                        <Input
                          id="maturityDate"
                          type="date"
                          value={listingForm.maturityDate}
                          onChange={(e) =>
                            setListingForm({
                              ...listingForm,
                              maturityDate: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor="borrower">Borrower</Label>
                        <Input
                          id="borrower"
                          value={listingForm.borrower}
                          onChange={(e) =>
                            setListingForm({
                              ...listingForm,
                              borrower: e.target.value,
                            })
                          }
                          placeholder="Enter borrower party"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateListing}>
                        Create Listing
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateListing(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4">
                {listings.map((listing) => (
                  <Card key={listing.listingId}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <ShoppingCart className="h-5 w-5" />
                          {listing.listingId}
                        </CardTitle>
                        <Badge className={getStatusColor(listing.status)}>
                          {listing.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        Loan: {listing.loanId} | Seller: {listing.seller}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium">Asking Price</p>
                          <p className="text-2xl font-bold text-blue-600">
                            ${listing.askingPrice}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Outstanding</p>
                          <p className="text-lg">
                            ${listing.loanDetails.outstandingAmount}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Interest Rate</p>
                          <p className="text-lg">
                            {listing.loanDetails.interestRate}%
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Effective Yield</p>
                          <p className="text-lg font-semibold text-green-600">
                            {calculateYield(
                              listing.loanDetails.interestRate,
                              listing.askingPrice,
                              listing.loanDetails.outstandingAmount
                            )}
                            %
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Original Amount</p>
                          <p>${listing.loanDetails.originalAmount}</p>
                        </div>
                        <div>
                          <p className="font-medium">Borrower</p>
                          <p>{listing.loanDetails.borrower}</p>
                        </div>
                        <div>
                          <p className="font-medium">Maturity Date</p>
                          <p>
                            {new Date(
                              listing.loanDetails.maturityDate
                            ).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="font-medium">Listed At</p>
                          <p>
                            {new Date(listing.listedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {listings.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">
                        No loan listings found
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="offers" className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">Offers</h2>
                <Button onClick={() => setShowCreateOffer(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Make Offer
                </Button>
              </div>

              {showCreateOffer && (
                <Card>
                  <CardHeader>
                    <CardTitle>Make Loan Offer</CardTitle>
                    <CardDescription>
                      Make an offer on a loan listing
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="offerId">Offer ID</Label>
                        <Input
                          id="offerId"
                          value={offerForm.offerId}
                          onChange={(e) =>
                            setOfferForm({
                              ...offerForm,
                              offerId: e.target.value,
                            })
                          }
                          placeholder="Enter offer ID"
                        />
                      </div>
                      <div>
                        <Label htmlFor="buyer">Buyer</Label>
                        <Input
                          id="buyer"
                          value={offerForm.buyer}
                          onChange={(e) =>
                            setOfferForm({
                              ...offerForm,
                              buyer: e.target.value,
                            })
                          }
                          placeholder="Enter buyer party"
                        />
                      </div>
                      <div>
                        <Label htmlFor="listingId">Listing ID</Label>
                        <Input
                          id="listingId"
                          value={offerForm.listingId}
                          onChange={(e) =>
                            setOfferForm({
                              ...offerForm,
                              listingId: e.target.value,
                            })
                          }
                          placeholder="Enter listing ID"
                        />
                      </div>
                      <div>
                        <Label htmlFor="offerPrice">Offer Price</Label>
                        <Input
                          id="offerPrice"
                          value={offerForm.offerPrice}
                          onChange={(e) =>
                            setOfferForm({
                              ...offerForm,
                              offerPrice: e.target.value,
                            })
                          }
                          placeholder="Enter offer price"
                        />
                      </div>
                      <div>
                        <Label htmlFor="validUntil">Valid Until</Label>
                        <Input
                          id="validUntil"
                          type="datetime-local"
                          value={offerForm.validUntil}
                          onChange={(e) =>
                            setOfferForm({
                              ...offerForm,
                              validUntil: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="terms">Terms</Label>
                        <Input
                          id="terms"
                          value={offerForm.terms}
                          onChange={(e) =>
                            setOfferForm({
                              ...offerForm,
                              terms: e.target.value,
                            })
                          }
                          placeholder="Enter offer terms"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleCreateOffer}>Make Offer</Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateOffer(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid gap-4">
                {offers.map((offer) => (
                  <Card key={offer.offerId}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5" />
                          {offer.offerId}
                        </CardTitle>
                        <Badge className={getStatusColor(offer.status)}>
                          {offer.status}
                        </Badge>
                      </div>
                      <CardDescription>
                        Listing: {offer.listingId} | Buyer: {offer.buyer}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium">Offer Price</p>
                          <p className="text-2xl font-bold text-green-600">
                            ${offer.offerPrice}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Status</p>
                          <p className="text-lg capitalize">{offer.status}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Valid Until</p>
                          <p className="text-lg">
                            {new Date(offer.validUntil).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Days Remaining</p>
                          <p className="text-lg">
                            {Math.max(
                              0,
                              Math.ceil(
                                (new Date(offer.validUntil).getTime() -
                                  Date.now()) /
                                  (1000 * 60 * 60 * 24)
                              )
                            )}
                          </p>
                        </div>
                      </div>

                      {offer.terms && (
                        <div>
                          <p className="text-sm font-medium mb-1">Terms</p>
                          <p className="text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                            {offer.terms}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {offers.length === 0 && (
                  <Card>
                    <CardContent className="text-center py-8">
                      <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground">No offers found</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
