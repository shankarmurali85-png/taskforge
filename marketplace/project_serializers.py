from rest_framework import serializers
from .models import Project
from .bid_serializers import BidSerializer
from .delivery_serializers import DeliverySerializer


class ProjectSerializer(serializers.ModelSerializer):
    client_username = serializers.CharField(
        source='client.username',
        read_only=True
    )
    bids = BidSerializer(many=True, read_only=True)
    delivery_set = DeliverySerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = [
            'id',
            'title',
            'description',
            'budget',
            'status',
            'client',
            'client_username',
            'bids',
            'delivery_set',
            'created_at',
        ]
        read_only_fields = ['client', 'status', 'created_at']
